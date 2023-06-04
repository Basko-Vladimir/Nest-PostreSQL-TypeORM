import { LikeEntity } from '../../likes/entities/db-entities/like.entity';
import { CommentEntity } from './db-entities/comment.entity';

export class IComment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
  userLogin?: string;
  blogId?: string;
  blogName?: string;
  postTitle?: string;
}

export interface IRawCommentWithLikeInfo extends CommentEntity {
  myLike: Partial<LikeEntity>;
  likesCount: number;
  dislikesCount: number;
}
