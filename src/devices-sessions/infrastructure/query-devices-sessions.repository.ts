import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { mapDbDeviceSessionToDeviceSessionOutputModel } from '../mappers/devices-sessions.mapper';
import { DeviceSessionOutputModel } from '../api/dto/devices-sessions-output-models.dto';

@Injectable()
export class QueryDevicesSessionsRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getAllActiveDevicesSessions(
    userId: string,
  ): Promise<DeviceSessionOutputModel[]> {
    const devicesSessions = await this.dataSource.query(
      `SELECT *
       FROM deviceSession
        WHERE "userId" = $1
      `,
      [userId],
    );

    return devicesSessions.map(mapDbDeviceSessionToDeviceSessionOutputModel);
  }
}
