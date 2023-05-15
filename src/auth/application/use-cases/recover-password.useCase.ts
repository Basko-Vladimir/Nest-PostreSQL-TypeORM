import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { EmailDto } from '../../api/dto/email.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailManager } from '../../../common/managers/email.manager';
import { generateCustomBadRequestException } from '../../../common/utils';
import { emailErrorMessages } from '../../../common/error-messages';

export class RecoverPasswordCommand {
  constructor(public emailDto: EmailDto) {}
}

@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase
  implements ICommandHandler<RecoverPasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailManager: EmailManager,
  ) {}

  async execute(command: RecoverPasswordCommand): Promise<void> {
    const { email } = command.emailDto;
    const newRecoveryCode = uuidv4();
    const { MISSING_USER_WITH_EMAIL_ERROR } = emailErrorMessages;
    const targetUser = await this.usersRepository.findUserByLoginOrEmail({
      email,
    });

    if (!targetUser) {
      generateCustomBadRequestException(MISSING_USER_WITH_EMAIL_ERROR, 'email');
    }

    await this.usersRepository.updatePasswordRecoveryCode(
      targetUser.id,
      newRecoveryCode,
    );

    try {
      return this.emailManager.formRecoverPasswordEmail(email, newRecoveryCode);
    } catch (error) {
      throw new Error(error);
    }
  }
}
