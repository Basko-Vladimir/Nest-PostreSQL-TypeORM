import { AllEntitiesOutputModel } from '../../../common/types';
import { IPostOutputModel } from '../../../posts/api/dto/posts-output-models.dto';
import { IBlogFileUploadingOutputModelDto } from '../../../files-uploading/api/dto/file-uploading-output-models.dto';

export interface IBlogOutputModel {
  id: string;
  name: string;
  websiteUrl: string;
  description: string;
  isMembership: boolean;
  createdAt: string;
  images: IBlogFileUploadingOutputModelDto;
}

export interface IBlogBanInfo {
  isBanned: boolean;
  banDate: string;
}

export interface IBlogForAdminOutputModel extends IBlogOutputModel {
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  banInfo: IBlogBanInfo;
}

export type AllBlogsOutputModel = AllEntitiesOutputModel<IBlogOutputModel>;
export type BlogAllFullPostsOutputModel =
  AllEntitiesOutputModel<IPostOutputModel>;

export type AllBlogsForAdminOutputModel =
  AllEntitiesOutputModel<IBlogForAdminOutputModel>;
