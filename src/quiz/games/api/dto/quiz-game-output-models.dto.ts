import { IAnswerOutputModel } from '../../../answers/api/dto/answer-output-models.dto';
import { QuizGameStatus } from '../../../../common/enums';
import { AllEntitiesOutputModel } from '../../../../common/types';

interface IPlayerProgress {
  answers: IAnswerOutputModel[];
  player: {
    id: string;
    login: string;
  };
  score: number;
}

export interface IStatisticOutputModel {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
}

export interface IQuizGameOutputModel {
  id: string;
  firstPlayerProgress: IPlayerProgress;
  secondPlayerProgress: IPlayerProgress;
  questions: { id: string; body: string }[];
  status: QuizGameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
}

export type AllMyGamesOutputModel =
  AllEntitiesOutputModel<IQuizGameOutputModel>;

export type UsersTopOutputModel = AllEntitiesOutputModel<IStatisticOutputModel>;
