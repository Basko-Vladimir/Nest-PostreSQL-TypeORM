import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailManager } from '../../../common/managers/email.manager';
import { CreateUserDto } from '../../../users/api/dto/create-user.dto';
import { generateExistingFieldError } from '../../../common/error-messages';
import { IUserOutputModel } from '../../../users/api/dto/users-output-models.dto';
import { mapUserEntityToUserOutputModel } from '../../../users/mappers/users-mappers';

export class RegisterUserCommand {
  constructor(
    public createUserDto: CreateUserDto,
    public isConfirmedByDefault: boolean = false,
  ) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailManager: EmailManager,
  ) {}

  async execute(command: RegisterUserCommand): Promise<IUserOutputModel> {
    const { createUserDto, isConfirmedByDefault } = command;
    const { password } = createUserDto;
    const passwordHash = await AuthService.generatePasswordHash(password);

    const existingUserLogin = await this.usersRepository.findUserByLoginOrEmail(
      {
        login: createUserDto.login,
      },
    );
    const existingUserEmail = await this.usersRepository.findUserByLoginOrEmail(
      {
        email: createUserDto.email,
      },
    );

    if (existingUserLogin) generateExistingFieldError('user', 'login');
    if (existingUserEmail) generateExistingFieldError('user', 'email');

    const user = await this.usersRepository.createUser(
      createUserDto,
      passwordHash,
      isConfirmedByDefault,
    );

    try {
      this.emailManager.formRegistrationEmail(
        user.email,
        user.emailConfirmation.confirmationCode,
      );
      return mapUserEntityToUserOutputModel(user);
    } catch (error) {
      console.log(error);
      await this.usersRepository.deleteUser(user.id);
      throw new Error(error);
    }
  }
}
