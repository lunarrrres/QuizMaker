import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    this.logger.log('JwtAuthGuard: checking activation');
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
    if (err || !user) {
      this.logger.error('JwtAuthGuard: Authentication failed', err || info);
    } else {
      this.logger.log('JwtAuthGuard: Authentication successful');
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
