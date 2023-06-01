import { IFullPostOutputModel } from '../api/dto/posts-output-models.dto';
import { LikeEntity } from '../../likes/entities/db-entities/like.entity';
import { BlogEntity } from '../../blogs/entities/db-entities/blog.entity';
import { LikeStatus } from '../../common/enums';
import {
  mapLikeEntityToLikeInfoOutputModel,
  NEWmapLikeEntityToLikeInfoOutputModel,
} from '../../likes/mappers/likes-mapper';
import { PostEntity } from '../entities/db-entities/post.entity';
import { UserEntity } from '../../users/entities/db-entities/user.entity';

export interface RawFullPost {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  userId: string;
  blogName: string;
  createdAt: Date;
  updatedAt: Date;
  user: Partial<UserEntity>;
  blog: Partial<BlogEntity>;
  myLike: Partial<LikeEntity>;
  likesCount: number;
  dislikesCount: number;
  newestLikes: LikeEntity[];
}

export const NEWmapPostEntityToPostOutputModel = (
  post: RawFullPost,
): IFullPostOutputModel => {
  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blog.name,
    createdAt: post.createdAt.toISOString(),
    extendedLikesInfo: {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus: post.myLike ? post.myLike.status : LikeStatus.NONE,
      newestLikes: post.newestLikes.map((like) =>
        NEWmapLikeEntityToLikeInfoOutputModel(like, post.user.login),
      ),
    },
  };
};

export const mapPostEntityToPostOutputModel = (post: PostEntity): any => {
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
