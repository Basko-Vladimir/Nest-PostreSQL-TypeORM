import {
  IBloggerCommentOutputModel,
  ICommentOutputModel,
} from '../api/dto/comments-output-models.dto';
import { IComment } from '../entities/interfaces';
import { LikesInfoOutputModel } from '../../likes/api/dto/likes-output-models.dto';
import { CommentEntity } from '../entities/db-entities/comment.entity';

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
  comment: IComment,
  likesInfo: LikesInfoOutputModel,
): IBloggerCommentOutputModel => ({
  id: comment.id,
  content: comment.content,
  commentatorInfo: {
    userId: comment.authorId,
    userLogin: comment.userLogin,
  },
  createdAt: comment.createdAt.toISOString(),
  postInfo: {
    id: comment.postId,
    blogId: comment.blogId,
    blogName: comment.blogName,
    title: comment.postTitle,
  },
  likesInfo,
});
