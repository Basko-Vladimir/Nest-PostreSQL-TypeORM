import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailManager } from '../../../common/managers/email.manager';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';

export class ResendRegistrationEmailCommand {
  constructor(public user: UserEntity) {}
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
    await this.emailManager.formRegistrationEmail(user);
  }
}
