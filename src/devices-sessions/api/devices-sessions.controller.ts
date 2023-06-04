import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';
import { DeviceSessionOutputModel } from './dto/devices-sessions-output-models.dto';
import { Session } from '../../common/decorators/session.decorator';
import { QueryDevicesSessionsRepository } from '../infrastructure/query-devices-sessions.repository';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllDevicesSessionsExceptCurrentCommand } from '../application/use-cases/delete-all-devices-sessions-except-current.useCase';
import { DeleteDeviceSessionCommand } from '../application/use-cases/delete-device-session.useCase';
import { IDeviceSession } from '../entities/interfaces';
import { RefreshTokenGuard } from '../../common/guards/refresh-token.guard';
import { DeleteDeviceSessionGuard } from '../../common/guards/delete-device-session.guard';
import { UserEntity } from '../../users/entities/db-entities/user.entity';

@Controller('security')
export class DevicesSessionsController {
  constructor(
    private queryDevicesSessionsRepository: QueryDevicesSessionsRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('devices')
  @UseGuards(RefreshTokenGuard)
  async getAllActiveDevicesSessions(
    @User() user: UserEntity,
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
  @UseGuards(RefreshTokenGuard, DeleteDeviceSessionGuard)
  async deleteDeviceSessionByDeviceId(
    @Session('id') deviceSessionId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteDeviceSessionCommand(deviceSessionId),
    );
  }
}
