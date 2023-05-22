import { DeviceSessionOutputModel } from '../api/dto/devices-sessions-output-models.dto';
import { DeviceSessionEntity } from '../entities/db-entities/device-session.entity';

export const mapDbDeviceSessionToDeviceSessionOutputModel = (
  deviceSession: DeviceSessionEntity,
): DeviceSessionOutputModel => {
  return {
    ip: deviceSession.ip,
    title: deviceSession.deviceName,
    lastActiveDate: deviceSession.issuedAt
      ? new Date(deviceSession.issuedAt).toISOString()
      : 'No lastActiveDate',
    deviceId: String(deviceSession.deviceId) || '',
  };
};
