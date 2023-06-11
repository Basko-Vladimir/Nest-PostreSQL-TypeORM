import { IAnswerOutputModel } from '../../../answers/api/dto/answer-output-models.dto';
import { QuizGameStatus } from '../../../../common/enums';

interface IPlayerProgress {
  answers: IAnswerOutputModel[];
  player: {
    id: string;
    login: string;
  };
  score: number;
}

export interface IGameOutputModel {
  id: string;
  firstPlayerProgress: IPlayerProgress;
  secondPlayerProgress: IPlayerProgress;
  questions: { id: string; body: string }[];
  status: QuizGameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
}
