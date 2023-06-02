import { IUserOutputModel } from '../api/dto/users-output-models.dto';
import { IBannedUserForBlogOutputModel } from '../api/dto/banned-users-for-specific-blog-output-model.dto';
import { UserEntity } from '../entities/db-entities/user.entity';
import { BannedUserForBlogEntity } from '../entities/db-entities/banned-user-for-blog.entity';

export const mapUserEntityToUserOutputModel = (
  user: UserEntity,
): IUserOutputModel => ({
  id: String(user.id),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
  banInfo: {
    isBanned: user.isBanned,
    banDate: user.banDate ? user.banDate.toISOString() : null,
    banReason: user.banReason,
  },
});

export const mapBannedUserForBlogEntityToBannedUserForBlogOutputModel = (
  data: BannedUserForBlogEntity,
): IBannedUserForBlogOutputModel => ({
  id: data.userId,
  login: data.user.login,
  banInfo: {
    isBanned: data.isBanned,
    banDate: data.banDate ? data.banDate.toISOString() : null,
    banReason: data.banReason,
  },
});
