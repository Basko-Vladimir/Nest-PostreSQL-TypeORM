import { LikeInfoOutputModel } from '../api/dto/likes-output-models.dto';
import { LikeEntity } from '../entities/db-entities/like.entity';

export const mapLikeEntityToLikeInfoOutputModel = (
  like: LikeEntity,
  login?: string,
): LikeInfoOutputModel => {
  return {
    addedAt: like.createdAt.toISOString(),
    userId: like.userId,
    login: like.user?.login || login, //TODO also need to rework after reworking findAllPostsRequests
  };
};
