import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { emailErrorMessages } from '../error-messages';
import { generateCustomBadRequestException } from '../utils';

@Injectable()
export class ResendingRegistrationEmailGuard implements CanActivate {
  constructor(private userRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const email = request.body.email;
    const { MISSING_USER_WITH_EMAIL_ERROR, CONFIRMED_EMAIL_ERROR } =
      emailErrorMessages;

    const user = await this.userRepository.findUserByLoginOrEmail({
      email,
    });

    if (!user) {
      generateCustomBadRequestException(MISSING_USER_WITH_EMAIL_ERROR, 'email');
    }
    if (user.isConfirmed) {
      generateCustomBadRequestException(CONFIRMED_EMAIL_ERROR, 'email');
    }

    request.context = { user };
    return true;
  }
}
