import { AllEntitiesOutputModel } from '../../../common/types';
import { ExtendedLikesInfoOutputModel } from '../../../likes/api/dto/likes-output-models.dto';

export interface IPostOutputModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
}

export interface IFullPostOutputModel extends IPostOutputModel {
  extendedLikesInfo: ExtendedLikesInfoOutputModel;
}

export type AllPostsOutputModel = AllEntitiesOutputModel<IPostOutputModel>;
