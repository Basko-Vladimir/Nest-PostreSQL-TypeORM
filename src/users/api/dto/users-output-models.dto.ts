import { AllEntitiesOutputModel } from '../../../common/types';

export interface IBanInfo {
  isBanned: boolean;
  banDate: string;
  banReason: string;
}

export interface IUserOutputModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: IBanInfo;
}

export type AllUsersOutputModel = AllEntitiesOutputModel<IUserOutputModel>;
