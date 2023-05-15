import { IBanInfo } from './users-output-models.dto';
import { AllEntitiesOutputModel } from '../../../common/types';

export interface IBannedUserForSpecificBlog {
  id: string;
  login: string;
  banInfo: IBanInfo;
}

export type AllBannedUsersForSpecificBlogOutputModel =
  AllEntitiesOutputModel<IBannedUserForSpecificBlog>;
