import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../../auth/infrastructure/jwt.service';
import { authErrorsMessages } from '../error-messages';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { getAuthHeaderValue } from '../utils';

const { INVALID_TOKEN } = authErrorsMessages;

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authValue = getAuthHeaderValue(context);
    const tokenPayload = await this.jwtService.getTokenPayload(authValue);

    if (!tokenPayload) {
      throw new UnauthorizedException(INVALID_TOKEN);
    }

    const targetUser = await this.usersRepository.findUserById(
      tokenPayload.userId,
    );

    if (!targetUser || targetUser.isBanned) {
      throw new UnauthorizedException();
    }

    request.context = {
      ...request.context,
      user: targetUser,
    };

    return true;
  }
}
