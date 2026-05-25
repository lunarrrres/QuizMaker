import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Tokens } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<Tokens & { user: any }> {
    if (dto.password !== dto.passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const newUser = await this.usersService.create(dto.email, hash, dto.name);

    const tokens = await this.generateTokens(newUser.id, newUser.email);
    await this.updateRefreshTokenHash(newUser.id, tokens.refreshToken);

    return {
      ...tokens,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    };
  }

  async login(dto: LoginDto): Promise<Tokens & { user: any }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access Denied');
    }

    const rtMatches = await bcrypt.compare(rt, user.refreshTokenHash);
    if (!rtMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async generateTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload = { sub: userId, email };

    const atOptions: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') as any,
    };

    const rtOptions: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ) as any,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, atOptions),
      this.jwtService.signAsync(jwtPayload, rtOptions),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hash);
  }
}
