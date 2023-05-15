import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateUserBanStatusDto } from '../../api/dto/update-user-ban-status.dto';
import { UsersRepository } from '../../infrastructure/users.repository';

export class UpdateUserBanStatusCommand {
  constructor(
    public userId: string,
    public updateUserBanStatusDto: UpdateUserBanStatusDto,
  ) {}
}

@CommandHandler(UpdateUserBanStatusCommand)
export class UpdateUserBanStatusUseCase
  implements ICommandHandler<UpdateUserBanStatusCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: UpdateUserBanStatusCommand): Promise<void> {
    const {
      userId,
      updateUserBanStatusDto: { isBanned, banReason },
    } = command;
    await this.usersRepository.updateUserBanStatus(userId, isBanned, banReason);
  }
}
