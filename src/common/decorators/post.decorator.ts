import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BloggerPost = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const post = request?.context?.post;

    return data ? post?.[data] : post;
  },
);
