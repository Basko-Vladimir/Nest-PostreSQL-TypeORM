import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ActionsOnBlogGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { user, blog } = request.context;

    if (blog.ownerId !== user.id) {
      throw new ForbiddenException();
    }

    return true;
  }
}
