import { QuizGameEntity } from '../entities/quiz-game.entity';
import { IQuizGameOutputModel } from '../api/dto/quiz-game-output-models.dto';
import { PlayerNumber } from '../../../common/enums';

export const mapQuizGameEntityToQuizGameOutputModel = (
  game: QuizGameEntity,
): IQuizGameOutputModel => {
  const firstPlayer = game.gameUsers.find(
    (user) => user.playerNumber === PlayerNumber.ONE,
  );
  const secondPlayer = game.gameUsers.find(
    (user) => user.playerNumber === PlayerNumber.TWO,
  );

  return {
    id: game.id,
    firstPlayerProgress: {
      answers: game.answers
        .filter((answer) => answer.playerId === firstPlayer.userId)
        .map((answer) => ({
          questionId: answer.questionId,
          answerStatus: answer.status,
          addedAt: answer.createdAt.toISOString(),
        })),
      player: {
        id: firstPlayer.userId,
        login: firstPlayer.user.login,
      },
      score: firstPlayer.score,
    },
    secondPlayerProgress: secondPlayer?.id
      ? {
          answers: game.answers
            .filter((answer) => answer.playerId === secondPlayer.userId)
            .map((answer) => ({
              questionId: answer.questionId,
              answerStatus: answer.status,
              addedAt: answer.createdAt.toISOString(),
            })),
          player: {
            id: secondPlayer.userId,
            login: secondPlayer.user.login,
          },
          score: secondPlayer.score,
        }
      : null,
    questions: game.questions.length
      ? game.questions.map((item) => ({ id: item.id, body: item.body }))
      : null,
    status: game.status,
    pairCreatedDate: game.createdAt.toISOString(),
    startGameDate: game.startGameDate ? game.startGameDate.toISOString() : null,
    finishGameDate: game.finishGameDate
      ? game.finishGameDate.toISOString()
      : null,
  };
};
