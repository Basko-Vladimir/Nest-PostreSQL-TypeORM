import { AllEntitiesOutputModel } from '../../../common/types';
import { LikesInfoOutputModel } from '../../../likes/api/dto/likes-output-models.dto';

interface ICommentatorInfo {
  userId: string;
  userLogin: string;
}

interface IPostInfo {
  id: string;
  title: string;
  blogId: string;
  blogName: string;
}

export interface ICommentOutputModel {
  id: string;
  content: string;
  commentatorInfo: ICommentatorInfo;
  createdAt: string;
}

export interface ICommentWithLikeInfoOutputModel extends ICommentOutputModel {
  likesInfo: LikesInfoOutputModel;
}

export interface IBloggerCommentOutputModel extends ICommentOutputModel {
  postInfo: IPostInfo;
}

export type AllCommentsOutputModel =
  AllEntitiesOutputModel<ICommentOutputModel>;

export type AllBloggerCommentsOutputModel =
  AllEntitiesOutputModel<IBloggerCommentOutputModel>;
