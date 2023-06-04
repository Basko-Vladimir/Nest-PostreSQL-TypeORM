import {
  IBloggerCommentOutputModel,
  ICommentOutputModel,
} from '../api/dto/comments-output-models.dto';
import { CommentEntity } from '../entities/db-entities/comment.entity';
import { IRawCommentWithLikeInfo } from '../entities/interfaces';
import { LikeStatus } from '../../common/enums';

export const mapCommentEntityToCommentOutputModel = (
  comment: CommentEntity,
): ICommentOutputModel => {
  return {
    id: comment.id,
    content: comment.content,
    commentatorInfo: {
      userId: comment.authorId,
      userLogin: comment.user.login,
    },
    createdAt: comment.createdAt.toISOString(),
  };
};

export const mapCommentEntityToBloggerCommentOutputModel = (
  comment: IRawCommentWithLikeInfo,
): IBloggerCommentOutputModel => ({
  id: comment.id,
  content: comment.content,
  createdAt: comment.createdAt.toISOString(),
  commentatorInfo: {
    userId: comment.authorId,
    userLogin: comment.user.login,
  },
  likesInfo: {
    likesCount: comment.likesCount,
    dislikesCount: comment.dislikesCount,
    myStatus: comment.myLike ? comment.myLike.status : LikeStatus.NONE,
  },
  postInfo: {
    id: comment.postId,
    title: comment.post.title,
    blogId: comment.post.blog.id,
    blogName: comment.post.blog.name,
  },
});
