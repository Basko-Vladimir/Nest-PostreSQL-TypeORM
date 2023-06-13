import { QuizGameEntity } from '../../../games/entities/quiz-game.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizAnswerRepository } from '../../infrastructure/quiz-answer.repository';
import { AnswerStatus } from '../../../../common/enums';
import { QUESTIONS_AMOUNT_IN_ONE_GAME } from '../../../../common/constants';
import { QuizGameRepository } from '../../../games/infrastructure/quiz-game.repository';
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
  ) {}

  async execute(command: GiveAnswerCommand): Promise<any> {
    const { userId, game, body } = command;
    const isCurrentUserFirst = userId === game.firstPlayerId;
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

    if (status === AnswerStatus.CORRECT) {
      await this.quizGameRepository.updateScore(
        game.id,
        isCurrentUserFirst,
        isCurrentUserFirst
          ? game.firstPlayerScore + 1
          : game.secondPlayerScore + 1,
      );
    }

    const savedAnswer = await this.quizAnswerRepository.createAnswer(
      game.id,
      userId,
      currentQuestion.id,
      body,
      status,
    );
    const actualStateGame = await this.quizGameRepository.findGameById(game.id);

    if (actualStateGame.questions.length === 2 * QUESTIONS_AMOUNT_IN_ONE_GAME) {
      await this.quizGameRepository.finishGame(
        actualStateGame.id,
        isCurrentUserFirst,
        actualStateGame.firstPlayerScore + 1,
      );
    }

    return mapQuizAnswerEntityToQuizAnswerOutputModel(savedAnswer);
  }
}
