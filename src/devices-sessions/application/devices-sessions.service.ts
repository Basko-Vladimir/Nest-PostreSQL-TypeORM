import { Injectable } from '@nestjs/common';
import { DevicesSessionsRepository } from '../infrastructure/devices-sessions.repository';
import { IDeviceSession } from '../entities/interfaces';

@Injectable()
export class DevicesSessionsService {
  constructor(private devicesSessionsRepository: DevicesSessionsRepository) {}

  async findDeviceSessionByDeviceId(
    deviceId: string,
  ): Promise<IDeviceSession | null> {
    const data =
      await this.devicesSessionsRepository.findDeviceSessionByDeviceId(
        deviceId,
      );

    return data[0] || null;
  }
}
