import { Response, Request } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserDto } from '../../users/api/dto/create-user.dto';
import { LoginOutputModel } from './dto/login-output-model.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegistrationConfirmationGuard } from '../../common/guards/registration-confirmation.guard';
import { User } from '../../common/decorators/user.decorator';
import { EmailDto } from './dto/email.dto';
import { ResendingRegistrationEmailGuard } from '../../common/guards/resending-registration-email.guard';
import { SetNewPasswordDto } from './dto/set-new-password.dto';
import { PasswordRecoveryCodeGuard } from '../../common/guards/password-recovery-code.guard';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { Session } from '../../common/decorators/session.decorator';
import { AuthMeOutputModelDto } from './dto/auth-me-output-model.dto';
import { ClientsRequestsGuard } from '../../common/guards/clients-requests.guard';
import { BearerAuthGuard } from '../../common/guards/bearer-auth.guard';
import { RegisterUserCommand } from '../application/use-cases/register-user.useCase';
import { ConfirmRegistrationCommand } from '../application/use-cases/confirm-registration.useCase';
import { ResendRegistrationEmailCommand } from '../application/use-cases/resend-registration-email.useCase';
import { LoginUserCommand } from '../application/use-cases/login-user.useCase';
import { RecoverPasswordCommand } from '../application/use-cases/recover-password.useCase';
import { ChangePasswordCommand } from '../application/use-cases/change-password.useCase';
import { RefreshTokensCommand } from '../application/use-cases/refresh-tokens.useCase';
import { LogoutCommand } from '../application/use-cases/logout.useCase';
import { IDeviceSession } from '../../devices-sessions/entities/interfaces';
import { UserEntity } from '../../users/entities/db-entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @Get('me')
  @UseGuards(BearerAuthGuard)
  async authMe(@User() user: UserEntity): Promise<AuthMeOutputModelDto> {
    return {
      userId: String(user.id),
      email: user.email,
      login: user.login,
    };
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards() //Temporary turned off ClientsRequestsGuard
  async registration(@Body() createUserDto: CreateUserDto): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommand(createUserDto));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RegistrationConfirmationGuard) //Temporary removing ClientsRequestsGuard
  async confirmRegistration(@User() user: UserEntity): Promise<void> {
    await this.commandBus.execute(new ConfirmRegistrationCommand(user.id));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(ResendingRegistrationEmailGuard) //Temporary removing ClientsRequestsGuard
  async resendRegistrationEmail(@User() user: UserEntity): Promise<void> {
    await this.commandBus.execute(new ResendRegistrationEmailCommand(user));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards() //Temporary turned off ClientsRequestsGuard
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<LoginOutputModel> {
    const { accessToken, refreshToken, refreshTokenSettings } =
      await this.commandBus.execute(
        new LoginUserCommand(
          loginUserDto,
          request.ip,
          request.headers['user-agent'] || 'test-user-agent',
        ),
      );

    response.cookie('refreshToken', refreshToken, refreshTokenSettings);

    return { accessToken };
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards() //Temporary turned off ClientsRequestsGuard
  async recoverPassword(@Body() emailDto: EmailDto): Promise<void> {
    return this.commandBus.execute(new RecoverPasswordCommand(emailDto));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(PasswordRecoveryCodeGuard) //Temporary removing ClientsRequestsGuard
  async changePassword(
    @Body() setNewPasswordDto: SetNewPasswordDto,
    @User() user: UserEntity,
  ): Promise<void> {
    return this.commandBus.execute(
      new ChangePasswordCommand(setNewPasswordDto, user),
    );
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(
    @User() user: UserEntity,
    @Session() session: IDeviceSession,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginOutputModel> {
    const { accessToken, refreshToken, refreshTokenSettings } =
      await this.commandBus.execute(new RefreshTokensCommand(user.id, session));

    response.cookie('refreshToken', refreshToken, refreshTokenSettings);

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async logout(@Session() session: IDeviceSession): Promise<void> {
    return this.commandBus.execute(new LogoutCommand(String(session.id)));
  }
}
