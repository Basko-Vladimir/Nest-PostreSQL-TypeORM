import { IUserOutputModel } from '../api/dto/users-output-models.dto';
import { IBannedUserForSpecificBlog } from '../api/dto/banned-users-for-specific-blog-output-model.dto';
import { IUser } from '../entities/interfaces';
import { DbUser } from '../entities/db-entities/user.entity';

export const mapDbUserToUserOutputModel = (user: DbUser): IUserOutputModel => ({
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

export const mapDbUserToBannedUserForSpecificBlogOutputModel = (
  user: IUser,
): IBannedUserForSpecificBlog => ({
  id: user.id,
  login: user.login,
  banInfo: {
    isBanned: user.isBannedForSpecificBlog,
    banDate: user.banDateForSpecificBlog
      ? user.banDateForSpecificBlog.toISOString()
      : null,
    banReason: user.banReasonForSpecificBlog,
  },
});
