import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { BannedUsersForBlogsRepository } from '../../users/infrastructure/banned-users-for-blogs-repository.service';

@Injectable()
export class CheckUserOnBanByPostGuard implements CanActivate {
  constructor(
    private bannedUsersForBlogsRepository: BannedUsersForBlogsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { user, post } = request.context;
    const isUserBannedForSpecificBlog =
      await this.bannedUsersForBlogsRepository.checkUserOnBanForBlog(
        user.id,
        post.blogId,
      );

    if (isUserBannedForSpecificBlog) throw new ForbiddenException();

    return true;
  }
}
