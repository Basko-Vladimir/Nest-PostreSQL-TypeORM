import { Request } from 'express';
import { validate } from 'class-validator';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateCustomBadRequestException } from '../utils';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { IdValidator } from '../validators/uuid.validator';
import { IUser } from '../../users/entities/interfaces';
import { IBlog } from '../../blogs/entities/interfaces';

@Injectable()
export class BindBlogWithUserGuard implements CanActivate {
  constructor(
    private usersRepository: UsersRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { id: blogId, userId } = request.params;
    const blogIdValidationErrors = await validate(new IdValidator(blogId));
    const userIdValidationErrors = await validate(new IdValidator(userId));
    let targetBlog: IBlog, targetUser: IUser;

    if (blogIdValidationErrors.length || userIdValidationErrors.length) {
      generateCustomBadRequestException('Invalid paramsId', 'paramsId');
    }

    try {
      targetUser = await this.usersRepository.findUserById(userId);
      targetBlog = await this.blogsRepository.findBlogById(blogId);

      if (!targetUser || !targetBlog) throw new NotFoundException();
    } catch (e) {
      generateCustomBadRequestException('Invalid paramsId', 'paramsId');
    }

    if (targetBlog.ownerId) {
      generateCustomBadRequestException(
        'Current blog was bound already!',
        'blogId',
      );
    }

    request.context = { user: targetUser, blog: targetBlog };

    return true;
  }
}
