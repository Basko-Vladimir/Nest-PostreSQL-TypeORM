import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../auth/infrastructure/jwt.service';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { DevicesSessionsRepository } from '../../devices-sessions/infrastructure/devices-sessions.repository';

@Injectable()
export class DeleteDeviceSessionGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private devicesSessionsRepository: DevicesSessionsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const deviceId = request.params.deviceId;
    const currentUserId = request.context.user.id;

    const targetDeviceSession =
      await this.devicesSessionsRepository.findDeviceSessionByDeviceId(
        deviceId,
      );

    if (!targetDeviceSession) throw new NotFoundException();

    if (targetDeviceSession.userId !== currentUserId) {
      throw new ForbiddenException();
    }

    request.context = { ...request.context, session: targetDeviceSession };

    return true;
  }
}
