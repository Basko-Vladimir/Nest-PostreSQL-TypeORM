import {
  IBlogForAdminOutputModel,
  IBlogOutputModel,
} from '../api/dto/blogs-output-models.dto';
import { BlogEntity } from '../entities/db-entities/blog.entity';

export const mapDbBlogToBlogOutputModel = (
  blog: BlogEntity,
): IBlogOutputModel => {
  return {
    id: blog.id,
    name: blog.name,
    websiteUrl: blog.websiteUrl,
    description: blog.description,
    isMembership: blog.isMembership,
    createdAt: blog.createdAt.toISOString(),
  };
};

export const mapDbBlogToBlogForAdminOutputModel = (
  blog: BlogEntity,
): IBlogForAdminOutputModel => {
  return {
    id: blog.id,
    name: blog.name,
    websiteUrl: blog.websiteUrl,
    description: blog.description,
    isMembership: blog.isMembership,
    createdAt: blog.createdAt.toISOString(),
    blogOwnerInfo: {
      userId: blog.ownerId,
      userLogin: blog.user.login,
    },
    banInfo: {
      isBanned: blog.isBanned,
      banDate: blog.banDate ? blog.banDate.toISOString() : null,
    },
  };
};
