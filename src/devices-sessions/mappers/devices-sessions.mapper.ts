import { DeviceSessionOutputModel } from '../api/dto/devices-sessions-output-models.dto';
import { IDeviceSession } from '../entities/interfaces';

export const mapDbDeviceSessionToDeviceSessionOutputModel = (
  deviceSession: IDeviceSession,
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
