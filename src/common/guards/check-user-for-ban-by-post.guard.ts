import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { BannedUsersForBlogsRepository } from '../../users/infrastructure/banned-users-for-blogs-repository.service';

@Injectable()
export class CheckUserForBanByPostGuard implements CanActivate {
  constructor(
    private bannedUsersForBlogsRepository: BannedUsersForBlogsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { user, post } = request.context;
    const isUserBannedForSpecificBlog =
      await this.bannedUsersForBlogsRepository.checkUserForBanForBlog(
        user.id,
        post.blogId,
      );

    if (isUserBannedForSpecificBlog) throw new ForbiddenException();

    return true;
  }
}
