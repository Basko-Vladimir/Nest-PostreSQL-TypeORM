import { ILike } from '../entities/interfaces';
import { LikeInfoOutputModel } from '../api/dto/likes-output-models.dto';

export const mapDbLikeToLikeInfoOutputModel = (
  like: ILike,
): LikeInfoOutputModel => {
  return {
    userId: like.userId,
    login: like.userLogin,
    addedAt: like.createdAt.toISOString(),
  };
};
