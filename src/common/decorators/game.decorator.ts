import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QuizGame = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const game = request?.context?.game;

    return data ? game?.[data] : game;
  },
);
