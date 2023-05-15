import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailManager } from '../../../common/managers/email.manager';
import { IUser } from '../../../users/entities/interfaces';

export class ResendRegistrationEmailCommand {
  constructor(public user: IUser) {}
}

@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailUseCase
  implements ICommandHandler<ResendRegistrationEmailCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected emailManager: EmailManager,
  ) {}

  async execute(command: ResendRegistrationEmailCommand): Promise<void> {
    const { user } = command;
    const newCode = uuidv4();

    await this.usersRepository.updateConfirmationCode(user.id, newCode);
    await this.emailManager.formRegistrationEmail({
      email: user.email,
      confirmationCode: newCode,
    });
  }
}
