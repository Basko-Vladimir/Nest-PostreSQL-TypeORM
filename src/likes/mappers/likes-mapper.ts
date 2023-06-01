import { LikeInfoOutputModel } from '../api/dto/likes-output-models.dto';
import { LikeEntity } from '../entities/db-entities/like.entity';

export const mapLikeEntityToLikeInfoOutputModel = (
  like: LikeEntity,
): LikeInfoOutputModel => {
  return {
    addedAt: like.createdAt.toISOString(),
    userId: like.userId,
    login: like.user.login,
  };
};

export const NEWmapLikeEntityToLikeInfoOutputModel = (
  like: LikeEntity,
  userLogin: string,
): LikeInfoOutputModel => {
  return {
    addedAt: like.createdAt.toISOString(),
    userId: like.userId,
    login: userLogin,
  };
};
