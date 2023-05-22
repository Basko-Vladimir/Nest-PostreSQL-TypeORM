import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { ITokensData } from '../../../common/types';
import { JwtService } from '../../infrastructure/jwt.service';
import {
  ACCESS_TOKEN_LIFE_TIME,
  REFRESH_TOKEN_LIFE_TIME,
} from '../../../common/constants';
import { IDeviceSession } from '../../../devices-sessions/entities/interfaces';
import { UpdateDeviceSessionCommand } from '../../../devices-sessions/application/use-cases/update-device-session.useCase';

export class RefreshTokensCommand {
  constructor(public userId: string, public session: IDeviceSession) {}
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase
  implements ICommandHandler<RefreshTokensCommand>
{
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  async execute(command: RefreshTokensCommand): Promise<ITokensData> {
    const { userId, session } = command;
    const { accessToken, refreshToken } =
      await this.authService.createNewTokensPair(
        { userId },
        ACCESS_TOKEN_LIFE_TIME,
        { userId, deviceId: session.deviceId },
        REFRESH_TOKEN_LIFE_TIME,
      );
    const refreshTokenPayload = await this.jwtService.getTokenPayload(
      refreshToken,
    );

    if (!refreshTokenPayload) {
      throw new Error(`Couldn't get payload from refresh token!`);
    }

    await this.commandBus.execute(
      new UpdateDeviceSessionCommand(session.id, refreshTokenPayload.iat),
    );

    return {
      accessToken,
      refreshToken,
      refreshTokenSettings: AuthService.setCookieSettings(refreshTokenPayload),
    };
  }
}
