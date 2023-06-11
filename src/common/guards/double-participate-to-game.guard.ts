import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { QuizGameRepository } from '../../quiz/games/infrastructure/quiz-game.repository';

@Injectable()
export class DoubleParticipateToGameGuard implements CanActivate {
  constructor(private quizGameRepository: QuizGameRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.context.user;
    const startedGame = await this.quizGameRepository.findStartedQuizGame();

    if (
      startedGame &&
      (user.id === startedGame.firstPlayerId ||
        user.id === startedGame.secondPlayerId)
    ) {
      throw new ForbiddenException();
    }

    request.context = { ...request.context, game: startedGame };

    return true;
  }
}
