import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { SetNewPasswordDto } from '../../api/dto/set-new-password.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';

export class ChangePasswordCommand {
  constructor(
    public setNewPasswordDto: SetNewPasswordDto,
    public user: UserEntity,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { setNewPasswordDto, user } = command;
    const { newPassword, recoveryCode } = setNewPasswordDto;
    const newHash = await AuthService.generatePasswordHash(newPassword);

    await this.usersRepository.updatePassword(user.id, newHash, recoveryCode);
  }
}
