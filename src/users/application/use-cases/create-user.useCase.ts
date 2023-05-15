import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../api/dto/create-user.dto';
import { validateOrRejectInputDto } from '../../../common/utils';
import { RegisterUserCommand } from '../../../auth/application/use-cases/register-user.useCase';
import { UsersRepository } from '../../infrastructure/users.repository';
import { IUserOutputModel } from '../../api/dto/users-output-models.dto';

export class CreateUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private commandBus: CommandBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<IUserOutputModel> {
    const { createUserDto } = command;
    await validateOrRejectInputDto(createUserDto, CreateUserDto);

    return this.commandBus.execute(
      new RegisterUserCommand(createUserDto, true),
    );
  }
}
