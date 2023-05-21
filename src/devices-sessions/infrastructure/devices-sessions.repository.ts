import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IDeviceSession } from '../entities/interfaces';
import { DeviceSessionEntity } from '../entities/db-entities/device-session.entity';

@Injectable()
export class DevicesSessionsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(DeviceSessionEntity)
    private typeOrmDeviceSessionRepository: Repository<DeviceSessionEntity>,
  ) {}

  async findDeviceSessionByDeviceId(
    deviceId: string,
  ): Promise<IDeviceSession | null> {
    return this.dataSource.query(
      `SELECT *
       FROM "deviceSession"
        WHERE "deviceId" = $1
      `,
      [deviceId],
    );
  }

  async findDeviceSessionByDeviceIdAndIssuedAt(
    deviceId: number,
    issuedAt: number,
  ): Promise<IDeviceSession | null> {
    const data = await this.dataSource.query(
      `SELECT *
       FROM "deviceSession"
        WHERE "deviceId" = $1 AND "issuedAt" = $2
      `,
      [deviceId, issuedAt],
    );

    return data[0] || null;
  }

  async createDeviceSession(
    deviceSessionData: Omit<
      DeviceSessionEntity,
      'id' | 'createdAt' | 'updatedAt' | 'user'
    >,
  ): Promise<void> {
    const { issuedAt, expiredDate, deviceId, deviceName, ip, userId } =
      deviceSessionData;

    await this.typeOrmDeviceSessionRepository
      .createQueryBuilder()
      .insert()
      .into(DeviceSessionEntity)
      .values({ issuedAt, expiredDate, deviceId, deviceName, ip, userId })
      .execute();
  }

  async updateDeviceSessionIssuedAt(
    deviceSessionId: string,
    issuedAt: number,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "deviceSession"
        SET "issuedAt" = $1
        WHERE "id" = $2
       `,
      [issuedAt, deviceSessionId],
    );
  }

  async deleteAllDevicesSessionsExceptCurrent(
    deviceSessionId: string,
  ): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM "deviceSession"
        WHERE "id" <> $1
      `,
      [deviceSessionId],
    );
  }

  async deleteAllDevicesSessions(): Promise<void> {
    await this.dataSource.query(`DELETE FROM "deviceSession"`);
  }

  async deleteDeviceSessionById(id: string): Promise<void> {
    return this.dataSource.query(
      `DELETE
       FROM "deviceSession"
        WHERE id = $1
      `,
      [id],
    );
  }
}
