import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { ITokensData } from '../../../common/types';
import { LoginUserDto } from '../../api/dto/login-user.dto';
import { JwtService } from '../../infrastructure/jwt.service';
import {
  ACCESS_TOKEN_LIFE_TIME,
  REFRESH_TOKEN_LIFE_TIME,
} from '../../../common/constants';
import { AuthService } from '../auth.service';
import { CreateDeviceSessionCommand } from '../../../devices-sessions/application/use-cases/create-device-session.useCase';
import { DeviceSessionEntity } from '../../../devices-sessions/entities/db-entities/device-session.entity';

export class LoginUserCommand {
  constructor(
    public loginUserDto: LoginUserDto,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  async execute(command: LoginUserCommand): Promise<ITokensData> {
    const { loginUserDto, userAgent, ip } = command;
    const { loginOrEmail, password } = loginUserDto;
    const deviceId = uuidv4();
    const userId = await this.authService.checkCredentials(
      loginOrEmail,
      password,
    );

    const { accessToken, refreshToken } =
      await this.authService.createNewTokensPair(
        { userId },
        ACCESS_TOKEN_LIFE_TIME,
        { userId, deviceId },
        REFRESH_TOKEN_LIFE_TIME,
      );
    const refreshTokenPayload = await this.jwtService.getTokenPayload(
      refreshToken,
    );

    if (!refreshTokenPayload) {
      throw new Error(`Couldn't get payload from refresh token!`);
    }

    const deviceSessionData: Omit<
      DeviceSessionEntity,
      'id' | 'createdAt' | 'updatedAt' | 'user'
    > = {
      issuedAt: refreshTokenPayload.iat,
      expiredDate: refreshTokenPayload.exp,
      deviceId: refreshTokenPayload.deviceId,
      deviceName: userAgent,
      ip,
      userId: userId,
    };

    await this.commandBus.execute(
      new CreateDeviceSessionCommand(deviceSessionData),
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenSettings: AuthService.setCookieSettings(refreshTokenPayload),
    };
  }
}
