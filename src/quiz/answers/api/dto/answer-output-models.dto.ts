import { AnswerStatus } from '../../../../common/enums';

export interface IAnswerOutputModel {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
}
