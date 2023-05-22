import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { mapDbDeviceSessionToDeviceSessionOutputModel } from '../mappers/devices-sessions.mapper';
import { DeviceSessionOutputModel } from '../api/dto/devices-sessions-output-models.dto';
import { DeviceSessionEntity } from '../entities/db-entities/device-session.entity';

@Injectable()
export class QueryDevicesSessionsRepository {
  constructor(
    @InjectRepository(DeviceSessionEntity)
    private typeOrmDeviceSessionRepository: Repository<DeviceSessionEntity>,
  ) {}

  async getAllActiveDevicesSessions(
    userId: string,
  ): Promise<DeviceSessionOutputModel[]> {
    const devicesSessions = await this.typeOrmDeviceSessionRepository
      .createQueryBuilder('deviceSession')
      .select('deviceSession')
      .where('deviceSession.user = :userId', { userId })
      .getMany();

    return devicesSessions.map(mapDbDeviceSessionToDeviceSessionOutputModel);
  }
}
