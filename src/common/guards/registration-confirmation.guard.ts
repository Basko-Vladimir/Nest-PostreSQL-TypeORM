import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { Request } from 'express';
import { confirmationCodeErrorMessages } from '../error-messages';
import { generateCustomBadRequestException } from '../utils';

@Injectable()
export class RegistrationConfirmationGuard implements CanActivate {
  constructor(private userRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const code = request.body.code;
    const { INVALID_CONFIRMATION_CODE, EXISTED_CONFIRMATION_CODE } =
      confirmationCodeErrorMessages;

    const user = await this.userRepository.findUserByConfirmationCode(code);

    if (!user) {
      generateCustomBadRequestException(INVALID_CONFIRMATION_CODE, 'code');
    }
    if (user.emailConfirmation.confirmationCode !== code) {
      generateCustomBadRequestException(INVALID_CONFIRMATION_CODE, 'code');
    }
    if (user.emailConfirmation.isConfirmed) {
      generateCustomBadRequestException(EXISTED_CONFIRMATION_CODE, 'code');
    }

    request.context = { user };
    return true;
  }
}
