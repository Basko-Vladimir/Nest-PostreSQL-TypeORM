import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ActionsOnCommentGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { user, comment } = request.context;

    if (comment.authorId !== user.id) {
      throw new ForbiddenException();
    }

    return true;
  }
}
