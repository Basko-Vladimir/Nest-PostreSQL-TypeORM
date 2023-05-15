export interface IDeviceSession {
  id: string;
  issuedAt: number;
  expiredDate: number;
  deviceId: string;
  deviceName: string;
  ip: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
