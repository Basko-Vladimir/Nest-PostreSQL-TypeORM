import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';
import { DeviceSessionOutputModel } from './dto/devices-sessions-output-models.dto';
import { Session } from '../../common/decorators/session.decorator';
import { QueryDevicesSessionsRepository } from '../infrastructure/query-devices-sessions.repository';
import { DevicesSessionsService } from '../application/devices-sessions.service';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllDevicesSessionsExceptCurrentCommand } from '../application/use-cases/delete-all-devices-sessions-except-current.useCase';
import { DeleteDeviceSessionCommand } from '../application/use-cases/delete-device-session.useCase';
import { IDeviceSession } from '../entities/interfaces';
import { IUser } from '../../users/entities/interfaces';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';

@Controller('security')
export class DevicesSessionsController {
  constructor(
    private devicesSessionsService: DevicesSessionsService,
    private queryDevicesSessionsRepository: QueryDevicesSessionsRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('devices')
  @UseGuards(RefreshTokenGuard)
  async getAllActiveDevicesSessions(
    @User() user: IUser,
  ): Promise<DeviceSessionOutputModel[]> {
    return this.queryDevicesSessionsRepository.getAllActiveDevicesSessions(
      user.id,
    );
  }

  @Delete('devices')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async deleteAllDevicesSessionsExceptCurrent(
    @Session() session: IDeviceSession,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteAllDevicesSessionsExceptCurrentCommand(session.id),
    );
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshTokenGuard)
  async deleteDeviceSessionByDeviceId(
    @Param('deviceId') deviceId: string,
    @User() user: IUser,
  ): Promise<void> {
    const targetDeviceSession =
      await this.devicesSessionsService.findDeviceSessionByDeviceId(deviceId);

    if (!targetDeviceSession) throw new NotFoundException();

    if (targetDeviceSession.userId !== user.id) {
      throw new ForbiddenException();
    }

    await this.commandBus.execute(
      new DeleteDeviceSessionCommand(String(targetDeviceSession.id)),
    );
  }
}
