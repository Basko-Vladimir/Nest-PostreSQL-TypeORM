import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { generateCustomBadRequestException } from '../utils';

@Injectable()
export class PasswordRecoveryCodeGuard implements CanActivate {
  constructor(private usersRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const recoveryCode = request.body.recoveryCode;

    const user = await this.usersRepository.findUserByPasswordRecoveryCode(
      recoveryCode,
    );

    if (!user || user.passwordRecoveryCode !== recoveryCode) {
      generateCustomBadRequestException(
        'Invalid recovery code',
        'recovery code',
      );
    }

    request.context = { user };

    return true;
  }
}
