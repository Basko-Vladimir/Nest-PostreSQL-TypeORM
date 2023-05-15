import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Comment = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const comment = request?.context?.comment;

    return data ? comment?.[data] : comment;
  },
);
