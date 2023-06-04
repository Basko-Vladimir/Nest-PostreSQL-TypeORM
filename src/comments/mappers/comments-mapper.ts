import {
  IBloggerCommentOutputModel,
  ICommentOutputModel,
} from '../api/dto/comments-output-models.dto';
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
  comment: CommentEntity,
): IBloggerCommentOutputModel => ({
  id: comment.id,
  content: comment.content,
  commentatorInfo: {
    userId: comment.authorId,
    userLogin: comment.post.blog.user.login,
  },
  createdAt: comment.createdAt.toISOString(),
  postInfo: {
    id: comment.postId,
    title: comment.post.title,
    blogId: comment.post.blog.id,
    blogName: comment.post.blog.name,
  },
});
