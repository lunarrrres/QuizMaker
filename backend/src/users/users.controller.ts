import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: { name?: string; avatarUrl?: string },
  ) {
    console.log('Update profile called for user:', user.userId);
    return this.usersService.updateProfile(user.userId, dto);
  }
}
