import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../auth/infrastructure/jwt.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { DevicesSessionsRepository } from '../../devices-sessions/infrastructure/devices-sessions.repository';
import { writeLogToFile } from '../utils';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private devicesSessionsRepository: DevicesSessionsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      await writeLogToFile(`Log 1, ${new Date()}`);
      throw new UnauthorizedException();
    }

    const tokenPayload = await this.jwtService.getTokenPayload(refreshToken);

    if (!tokenPayload) {
      await writeLogToFile(`Log 2, ${new Date()}`);
      throw new UnauthorizedException();
    }

    const currentDeviceSession =
      await this.devicesSessionsRepository.findDeviceSessionByDeviceIdAndIssuedAt(
        tokenPayload.deviceId,
        tokenPayload.iat,
      );

    if (!currentDeviceSession) {
      await writeLogToFile(`Log 3, ${new Date()}`);
      throw new UnauthorizedException();
    }

    const user = await this.usersRepository.findUserById(tokenPayload.userId);
    request.context = { user, session: currentDeviceSession };

    return true;
  }
}
