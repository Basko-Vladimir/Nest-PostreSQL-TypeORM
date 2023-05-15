import {
  IBlogForAdminOutputModel,
  IBlogOutputModel,
} from '../api/dto/blogs-output-models.dto';
import { IBlog } from '../entities/interfaces';

export const mapDbBlogToBlogOutputModel = (blog: IBlog): IBlogOutputModel => {
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
  blog: IBlog,
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
      userLogin: blog.ownerLogin,
    },
    banInfo: {
      isBanned: blog.isBanned,
      banDate: blog.banDate ? blog.banDate.toISOString() : null,
    },
  };
};
