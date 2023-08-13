import {
  IBlogForAdminOutputModel,
  IBlogOutputModel,
} from '../api/dto/blogs-output-models.dto';
import { BlogEntity } from '../entities/db-entities/blog.entity';
import { mapBlogFileUploadingEntityToBlogFileUploadingOutputModel } from '../../files-uploading/mappers/file-uploading-mappers';

export const mapBlogEntityToBlogOutputModel = (
  blog: BlogEntity,
): IBlogOutputModel => {
  if (!blog) return null;

  return {
    id: blog.id,
    name: blog.name,
    websiteUrl: blog.websiteUrl,
    description: blog.description,
    createdAt: blog.createdAt.toISOString(),
    isMembership: blog.isMembership,
    images: mapBlogFileUploadingEntityToBlogFileUploadingOutputModel(
      blog.uploadedFiles,
    ),
  };
};

export const mapBlogEntityToBlogForAdminOutputModel = (
  blog: BlogEntity,
): IBlogForAdminOutputModel => {
  return {
    id: blog.id,
    name: blog.name,
    websiteUrl: blog.websiteUrl,
    description: blog.description,
    isMembership: blog.isMembership,
    createdAt: blog.createdAt.toISOString(),
    images: mapBlogFileUploadingEntityToBlogFileUploadingOutputModel(
      blog.uploadedFiles,
    ),
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
