import { IPostOutputModel } from '../api/dto/posts-output-models.dto';
import { IPost } from '../entities/interfaces';

export const mapDbPostToPostOutputModel = (post: IPost): IPostOutputModel => {
  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt.toISOString(),
  };
};
