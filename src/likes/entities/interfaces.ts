import { LikeStatus } from '../../common/enums';

export interface ILike {
  id: string;
  status: LikeStatus;
  userId: string;
  postId: string;
  commentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  userLogin?: string;
}
