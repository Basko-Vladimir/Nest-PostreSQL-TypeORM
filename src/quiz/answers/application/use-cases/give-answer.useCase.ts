import { QuizGameEntity } from '../../../games/entities/quiz-game.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Timeout } from '@nestjs/schedule';
import { QuizAnswerRepository } from '../../infrastructure/quiz-answer.repository';
import {
  AnswerStatus,
  PlayerNumber,
  PlayerResult,
} from '../../../../common/enums';
import { QuizGameRepository } from '../../../games/infrastructure/quiz-game.repository';
import { AppService } from '../../../../app.service';
import {
  FINISH_GAME_TIMER,
  QUESTIONS_AMOUNT_IN_ONE_GAME,
} from '../../../../common/constants';
import { mapQuizAnswerEntityToQuizAnswerOutputModel } from '../../mappers/quiz-answer.mapper';
import { QueryRunner } from 'typeorm';
import { IAnswerOutputModel } from '../../api/dto/answer-output-models.dto';
import { GameUserEntity } from '../../../games/entities/game-user.entity';

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

  async execute(command: GiveAnswerCommand): Promise<IAnswerOutputModel> {
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
    let currentGame;

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

      currentGame = await this.quizGameRepository.findGameById(
        game.id,
        queryRunner,
      );

      if (currentGame.answers.length === 2 * QUESTIONS_AMOUNT_IN_ONE_GAME) {
        const lastAnswer = currentGame.answers[currentGame.answers.length - 1];
        const quickerPlayer = currentGame.gameUsers.find(
          (player) => player.userId !== lastAnswer.playerId,
        );
        const hasOneCorrectAnswer = currentGame.answers.some((item) => {
          return (
            item.playerId === quickerPlayer.userId &&
            item.status === AnswerStatus.CORRECT
          );
        });

        await this.finishGameAndCountScores(
          currentGame.id,
          queryRunner,
          quickerPlayer.score + Number(hasOneCorrectAnswer),
          quickerPlayer.id,
        );
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error(e);
    } finally {
      await queryRunner.release();
    }

    const currentPlayerAnswersNumber = currentGame.answers.filter(
      (answer) => answer.playerId === currentPlayer.userId,
    ).length;

    if (currentPlayerAnswersNumber === QUESTIONS_AMOUNT_IN_ONE_GAME) {
      const actualCurrentPlayerState = currentGame.gameUsers.find(
        (item) => item.id === currentPlayer.id,
      );

      this.forceFinishGameByTimeout(currentGame.id, actualCurrentPlayerState);
    }

    return mapQuizAnswerEntityToQuizAnswerOutputModel(savedAnswer);
  }

  private async finishGameAndCountScores(
    currentGameId: string,
    queryRunner: QueryRunner,
    score: number,
    winnerId: string,
  ): Promise<void> {
    await this.quizGameRepository.finishGame(currentGameId, queryRunner);
    await this.quizGameRepository.updateScore(winnerId, score, queryRunner);

    const finishedGame = await this.quizGameRepository.findGameById(
      currentGameId,
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

  @Timeout(FINISH_GAME_TIMER)
  private async forceFinishGameByTimeout(
    currentGameId: string,
    currentPlayer: GameUserEntity,
  ): Promise<void> {
    const queryRunner = await this.appService.startTransaction();

    try {
      const updatedActualStateGame = await this.quizGameRepository.findGameById(
        currentGameId,
        queryRunner,
      );

      if (updatedActualStateGame) {
        await this.finishGameAndCountScores(
          updatedActualStateGame.id,
          queryRunner,
          currentPlayer.score + 1,
          currentPlayer.id,
        );
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error(e);
    } finally {
      await queryRunner.release();
    }
  }
}
