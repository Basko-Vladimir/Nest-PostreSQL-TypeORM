import { IBanInfo } from './users-output-models.dto';
import { AllEntitiesOutputModel } from '../../../common/types';

export interface IBannedUserForBlogOutputModel {
  id: string;
  login: string;
  banInfo: IBanInfo;
}

export type AllBannedUsersForSpecificBlogOutputModel =
  AllEntitiesOutputModel<IBannedUserForBlogOutputModel>;
