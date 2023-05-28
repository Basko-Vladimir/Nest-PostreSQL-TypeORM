import { IPostOutputModel } from '../api/dto/posts-output-models.dto';
import { PostEntity } from '../entities/db-entities/post.entity';

export const mapPostEntityToPostOutputModel = (
  post: PostEntity,
): IPostOutputModel => {
  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blog.name,
    createdAt: post.createdAt.toISOString(),
  };
};
