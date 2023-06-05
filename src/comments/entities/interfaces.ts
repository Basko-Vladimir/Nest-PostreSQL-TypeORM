import { LikeEntity } from '../../likes/entities/db-entities/like.entity';
import { CommentEntity } from './db-entities/comment.entity';

export interface IRawCommentWithLikeInfo extends CommentEntity {
  myLike: Partial<LikeEntity>;
  likesCount: number;
  dislikesCount: number;
}
