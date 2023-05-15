import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Blog = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const blog = request?.context?.blog;

    return data ? blog?.[data] : blog;
  },
);
