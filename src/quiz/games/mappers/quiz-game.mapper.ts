import { QuizGameEntity } from '../entities/quiz-game.entity';
import { IQuizGameOutputModel } from '../api/dto/quiz-game-output-models.dto';

export const mapQuizGameEntityToQuizGameOutputModel = (
  game: QuizGameEntity,
): IQuizGameOutputModel => {
  const firstPlayer = game.users.find((user) => user.id === game.firstPlayerId);
  const secondPlayer = game.users.find(
    (user) => user.id === game.secondPlayerId,
  );

  return {
    id: game.id,
    firstPlayerProgress: {
      answers: game.answers
        .filter((answer) => answer.playerId === game.firstPlayerId)
        .map((answer) => ({
          questionId: answer.questionId,
          answerStatus: answer.status,
          addedAt: answer.createdAt.toISOString(),
        })),
      player: {
        id: game.firstPlayerId,
        login: firstPlayer.login,
      },
      score: game.firstPlayerScore,
    },
    secondPlayerProgress: game.secondPlayerId
      ? {
          answers: game.answers
            .filter((answer) => answer.playerId === game.secondPlayerId)
            .map((answer) => ({
              questionId: answer.questionId,
              answerStatus: answer.status,
              addedAt: answer.createdAt.toISOString(),
            })),
          player: {
            id: game.secondPlayerId,
            login: secondPlayer?.login,
          },
          score: game.secondPlayerScore,
        }
      : null,
    questions: game.questions.length ? game.questions : null,
    status: game.status,
    pairCreatedDate: game.createdAt.toISOString(),
    startGameDate: game.startGameDate ? game.startGameDate.toISOString() : null,
    finishGameDate: game.finishGameDate
      ? game.finishGameDate.toISOString()
      : null,
  };
};
