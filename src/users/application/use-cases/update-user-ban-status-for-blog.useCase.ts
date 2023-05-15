import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserBanStatusForBlogDto } from '../../api/dto/update-user-ban-status-for-blog.dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { UsersRepository } from '../../infrastructure/users.repository';
import { BannedUsersForBlogsRepository } from '../../infrastructure/banned-users-for-blogs-repository.service';

export class UpdateUserBanStatusForBlogCommand {
  constructor(
    public blockedUserId: string,
    public currentUserId: string,
    public updateUserBanStatusForBlogDto: UpdateUserBanStatusForBlogDto,
  ) {}
}

@CommandHandler(UpdateUserBanStatusForBlogCommand)
export class UpdateUserBanStatusForBlogUseCase
  implements ICommandHandler<UpdateUserBanStatusForBlogCommand>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepository,
    private bannedUsersForBlogsRepository: BannedUsersForBlogsRepository,
  ) {}

  async execute(command: UpdateUserBanStatusForBlogCommand): Promise<void> {
    const {
      blockedUserId,
      updateUserBanStatusForBlogDto: { blogId, banReason, isBanned },
      currentUserId,
    } = command;
    const isBannedValue = typeof isBanned === 'boolean' ? isBanned : false;
    const banDate = isBannedValue ? new Date().toISOString() : null;

    const targetBlog = await this.blogsRepository.findBlogById(blogId);

    if (!targetBlog) throw new NotFoundException();

    if (targetBlog.ownerId !== currentUserId) {
      throw new ForbiddenException();
    }

    const bannedUserForBlog =
      await this.bannedUsersForBlogsRepository.findBannedUserForBlog(
        targetBlog.id,
        blockedUserId,
      );

    if (bannedUserForBlog) {
      return this.bannedUsersForBlogsRepository.updateUserBanStatusForSpecificBlog(
        blogId,
        blockedUserId,
        isBannedValue,
        banReason,
        banDate,
      );
    }

    return this.bannedUsersForBlogsRepository.createBannedUserForBlog(
      blogId,
      blockedUserId,
      isBannedValue,
      banReason,
    );
  }
}
