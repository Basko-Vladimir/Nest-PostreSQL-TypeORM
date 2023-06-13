import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { QuizGameRepository } from '../../quiz/games/infrastructure/quiz-game.repository';
import { QUESTIONS_AMOUNT_IN_ONE_GAME } from '../constants';

@Injectable()
export class CheckParticipationInGameGuard implements CanActivate {
  constructor(private quizGameRepository: QuizGameRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.context.user;
    const existingActiveGame =
      await this.quizGameRepository.checkExistingActiveGame(user.id);

    if (!existingActiveGame) {
      throw new ForbiddenException();
    }

    const currentUserAnswers = existingActiveGame.answers.filter(
      (item) => item.playerId === user.id,
    );

    if (currentUserAnswers.length >= QUESTIONS_AMOUNT_IN_ONE_GAME) {
      throw new ForbiddenException();
    }
    request.context = { ...request.context, game: existingActiveGame };

    return true;
  }
}
