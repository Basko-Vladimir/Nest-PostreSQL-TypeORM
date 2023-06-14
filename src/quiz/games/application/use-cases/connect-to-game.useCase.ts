import { UserEntity } from '../../../../users/entities/db-entities/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../infrastructure/quiz-game.repository';
import { QuizAdminQuestionsRepository } from '../../../questions/infrastructure/quiz-admin-questions.repository';
import { QuizGameEntity } from '../../entities/quiz-game.entity';
import { generateCustomBadRequestException } from '../../../../common/utils';

export class ConnectToGameCommand {
  constructor(public user: UserEntity, public startedGame: QuizGameEntity) {}
}

@CommandHandler(ConnectToGameCommand)
export class ConnectToGameUseCase
  implements ICommandHandler<ConnectToGameCommand>
{
  constructor(
    private quizGameRepository: QuizGameRepository,
    private quizQuestionsRepository: QuizAdminQuestionsRepository,
  ) {}

  async execute(command: ConnectToGameCommand): Promise<string> {
    const { user, startedGame } = command;

    if (startedGame) {
      const questions =
        await this.quizQuestionsRepository.findRandomQuestions();

      if (!questions.length) {
        throw generateCustomBadRequestException(
          'Questions are not found!',
          'questions',
        );
      }

      const questionIds = questions.map((item) => item.id);

      await this.quizGameRepository.createGameUser(startedGame.id, user.id);
      await this.quizGameRepository.createManyGameQuestions(
        startedGame.id,
        questionIds,
      );
      await this.quizGameRepository.startGame(startedGame.id, user);

      return startedGame.id;
    } else {
      return this.quizGameRepository.createGame(user);
    }
  }
}
