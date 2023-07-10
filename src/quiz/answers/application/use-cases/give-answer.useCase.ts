import { QuizGameEntity } from '../../../games/entities/quiz-game.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizAnswerRepository } from '../../infrastructure/quiz-answer.repository';
import {
  AnswerStatus,
  PlayerNumber,
  PlayerResult,
} from '../../../../common/enums';
import { QuizGameRepository } from '../../../games/infrastructure/quiz-game.repository';
import { AppService } from '../../../../app.service';
import { QUESTIONS_AMOUNT_IN_ONE_GAME } from '../../../../common/constants';
import { mapQuizAnswerEntityToQuizAnswerOutputModel } from '../../mappers/quiz-answer.mapper';

export class GiveAnswerCommand {
  constructor(
    public userId: string,
    public game: QuizGameEntity,
    public body: string,
  ) {}
}

@CommandHandler(GiveAnswerCommand)
export class GiveAnswerUseCase implements ICommandHandler<GiveAnswerCommand> {
  constructor(
    private quizAnswerRepository: QuizAnswerRepository,
    private quizGameRepository: QuizGameRepository,
    private appService: AppService,
  ) {}

  async execute(command: GiveAnswerCommand): Promise<any> {
    const { userId, game, body } = command;
    const currentPlayer = game.gameUsers.find(
      (player) => player.userId === userId,
    );
    const currentQuestionIndex = game.answers.filter(
      (item) => item.playerId === userId,
    ).length;
    const currentQuestion = game.questions[currentQuestionIndex];
    const correctAnswers = JSON.parse(currentQuestion.correctAnswers).map(
      (item) => item.toLowerCase(),
    );
    const status = correctAnswers.includes(body.toLowerCase())
      ? AnswerStatus.CORRECT
      : AnswerStatus.INCORRECT;
    const queryRunner = await this.appService.startTransaction();
    let savedAnswer;

    try {
      savedAnswer = await this.quizAnswerRepository.createAnswer(
        game.id,
        userId,
        currentQuestion.id,
        body,
        status,
        queryRunner,
      );

      if (status === AnswerStatus.CORRECT) {
        await this.quizGameRepository.updateScore(
          currentPlayer.id,
          currentPlayer.score + 1,
          queryRunner,
        );
      }

      const actualStateGame = await this.quizGameRepository.findGameById(
        game.id,
        queryRunner,
      );

      if (actualStateGame.answers.length === 2 * QUESTIONS_AMOUNT_IN_ONE_GAME) {
        const lastAnswer =
          actualStateGame.answers[actualStateGame.answers.length - 1];
        const quickerPlayer = actualStateGame.gameUsers.find(
          (player) => player.userId !== lastAnswer.playerId,
        );
        const hasOneCorrectAnswer = actualStateGame.answers.some((item) => {
          return (
            item.playerId === quickerPlayer.userId &&
            item.status === AnswerStatus.CORRECT
          );
        });

        await this.quizGameRepository.updateScore(
          quickerPlayer.id,
          quickerPlayer.score + Number(hasOneCorrectAnswer),
          queryRunner,
        );

        await this.quizGameRepository.finishGame(
          actualStateGame.id,
          queryRunner,
        );

        const finishedGame = await this.quizGameRepository.findGameById(
          game.id,
          queryRunner,
        );
        const firstPlayer = finishedGame.gameUsers.find(
          (item) => item.playerNumber === PlayerNumber.ONE,
        );
        const secondPlayer = finishedGame.gameUsers.find(
          (item) => item.playerNumber === PlayerNumber.TWO,
        );
        let firstPlayerResult, secondPlayerResult;

        if (firstPlayer.score === secondPlayer.score) {
          firstPlayerResult = PlayerResult.DRAW;
          secondPlayerResult = PlayerResult.DRAW;
        } else if (firstPlayer.score > secondPlayer.score) {
          firstPlayerResult = PlayerResult.WINNER;
          secondPlayerResult = PlayerResult.LOSER;
        } else if (firstPlayer.score < secondPlayer.score) {
          firstPlayerResult = PlayerResult.LOSER;
          secondPlayerResult = PlayerResult.WINNER;
        }

        await this.quizGameRepository.setPlayersStatuses(
          firstPlayer.id,
          firstPlayerResult,
          secondPlayer.id,
          secondPlayerResult,
          queryRunner,
        );
      }

      await queryRunner.commitTransaction();

      return mapQuizAnswerEntityToQuizAnswerOutputModel(savedAnswer);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error(e);
    } finally {
      await queryRunner.release();
    }
  }
}
