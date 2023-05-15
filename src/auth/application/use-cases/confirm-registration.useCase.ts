import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class ConfirmRegistrationCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmRegistrationCommand): Promise<void> {
    const { userId } = command;

    return this.usersRepository.confirmUserRegistration(userId);
  }
}
