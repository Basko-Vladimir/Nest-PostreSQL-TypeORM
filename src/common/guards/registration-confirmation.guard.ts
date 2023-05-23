import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { Request } from 'express';
import { confirmationCodeErrorMessages } from '../error-messages';
import { generateCustomBadRequestException } from '../utils';
import { validate } from 'class-validator';
import { IdValidator } from '../validators/uuid.validator';

@Injectable()
export class RegistrationConfirmationGuard implements CanActivate {
  constructor(private userRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const code = request.body.code;
    const codeValidationErrors = await validate(new IdValidator(code));
    const {
      INVALID_CONFIRMATION_CODE,
      EXISTED_CONFIRMATION_CODE,
      CONFIRMATION_CODE_IS_EXPIRED,
    } = confirmationCodeErrorMessages;

    if (codeValidationErrors.length) {
      generateCustomBadRequestException('Invalid code', 'code');
    }

    const user = await this.userRepository.findUserByConfirmationCode(code);

    if (!user || user.emailConfirmation.confirmationCode !== code) {
      generateCustomBadRequestException(INVALID_CONFIRMATION_CODE, 'code');
    }
    if (user.emailConfirmation.isConfirmed) {
      generateCustomBadRequestException(EXISTED_CONFIRMATION_CODE, 'code');
    }
    if (user.emailConfirmation.expirationDate > new Date()) {
      generateCustomBadRequestException(CONFIRMATION_CODE_IS_EXPIRED, 'code');
    }

    request.context = { user };
    return true;
  }
}
