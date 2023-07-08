import { UserEntity } from '../../../../users/entities/db-entities/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameRepository } from '../../infrastructure/quiz-game.repository';
import { QuizAdminQuestionsRepository } from '../../../questions/infrastructure/quiz-admin-questions.repository';
import { QuizGameEntity } from '../../entities/quiz-game.entity';
import { generateCustomBadRequestException } from '../../../../common/utils';
import { AppService } from '../../../../app.service';
import { PlayerNumber } from '../../../../common/enums';

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
    private appService: AppService,
  ) {}

  async execute(command: ConnectToGameCommand): Promise<string> {
    const { user, startedGame } = command;
    const queryRunner = await this.appService.startTransaction();
    let gameId;

    try {
      if (startedGame) {
        const questions =
          await this.quizQuestionsRepository.findRandomQuestions(queryRunner);

        if (!questions.length) {
          generateCustomBadRequestException(
            'Questions are not found!',
            'questions',
          );
        }

        const questionIds = questions.map((item) => item.id);

        await this.quizGameRepository.createGameUser(
          startedGame.id,
          user.id,
          PlayerNumber.TWO,
          queryRunner,
        );
        await this.quizGameRepository.createManyGameQuestions(
          startedGame.id,
          questionIds,
          queryRunner,
        );
        await this.quizGameRepository.startGame(
          startedGame.id,
          user,
          queryRunner,
        );

        gameId = startedGame.id;
      } else {
        gameId = await this.quizGameRepository.createGame(user, queryRunner);
        await this.quizGameRepository.createGameUser(
          gameId,
          user.id,
          PlayerNumber.ONE,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

      return gameId;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error(e);
    } finally {
      await queryRunner.release();
    }
  }
}
