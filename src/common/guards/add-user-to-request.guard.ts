import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../auth/infrastructure/jwt.service';
import { AuthType } from '../enums';
import { UsersRepository } from '../../users/infrastructure/users.repository';

@Injectable()
export class AddUserToRequestGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    request.context = {};

    if (authHeader) {
      const [authType, authValue] = authHeader.split(' ');

      if (authType.toLowerCase() === AuthType.BEARER) {
        const tokenPayload = await this.jwtService.getTokenPayload(authValue);

        const user = await this.usersRepository.findUserById(
          tokenPayload.userId,
        );
        if (user) request.context = { user };
      }
    }

    return true;
  }
}
