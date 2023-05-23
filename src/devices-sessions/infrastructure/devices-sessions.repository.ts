import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DeviceSessionEntity } from '../entities/db-entities/device-session.entity';

@Injectable()
export class DevicesSessionsRepository {
  constructor(
    @InjectRepository(DeviceSessionEntity)
    private typeOrmDeviceSessionRepository: Repository<DeviceSessionEntity>,
  ) {}

  async findDeviceSessionByDeviceId(
    deviceId: string,
  ): Promise<DeviceSessionEntity | null> {
    return this.typeOrmDeviceSessionRepository
      .createQueryBuilder('deviceSession')
      .select('deviceSession')
      .where('deviceSession.deviceId = :deviceId', { deviceId })
      .getOne();
  }

  async findDeviceSessionByDeviceIdAndIssuedAt(
    deviceId: number,
    issuedAt: number,
  ): Promise<DeviceSessionEntity | null> {
    return this.typeOrmDeviceSessionRepository
      .createQueryBuilder('deviceSession')
      .select('deviceSession')
      .where('deviceSession.deviceId = :deviceId', { deviceId })
      .andWhere('deviceSession.issuedAt = :issuedAt', { issuedAt })
      .getOne();
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
    await this.typeOrmDeviceSessionRepository
      .createQueryBuilder()
      .update(DeviceSessionEntity)
      .set({ issuedAt })
      .where('id = :deviceSessionId', { deviceSessionId })
      .execute();
  }

  async deleteAllDevicesSessionsExceptCurrent(
    deviceSessionId: string,
  ): Promise<void> {
    await this.typeOrmDeviceSessionRepository
      .createQueryBuilder('deviceSession')
      .delete()
      .where('id != :deviceSessionId', { deviceSessionId })
      .execute();
  }

  async deleteDeviceSessionById(deviceSessionId: string): Promise<void> {
    await this.typeOrmDeviceSessionRepository
      .createQueryBuilder()
      .delete()
      .from(DeviceSessionEntity)
      .where('id = :deviceSessionId', { deviceSessionId })
      .execute();
  }
}
