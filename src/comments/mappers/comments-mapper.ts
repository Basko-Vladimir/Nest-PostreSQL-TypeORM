import {
  IBloggerCommentOutputModel,
  ICommentOutputModel,
} from '../api/dto/comments-output-models.dto';
import { IComment } from '../entities/interfaces';
import { LikesInfoOutputModel } from '../../likes/api/dto/likes-output-models.dto';

export const mapDbCommentToCommentOutputModel = (
  comment: IComment,
): ICommentOutputModel => {
  return {
    id: comment.id,
    content: comment.content,
    commentatorInfo: {
      userId: comment.authorId,
      userLogin: comment.userLogin,
    },
    createdAt: comment.createdAt.toISOString(),
  };
};

export const mapDbCommentToBloggerCommentOutputModel = (
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
