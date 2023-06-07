import { AllEntitiesOutputModel } from '../../../../common/types';

export interface IQuizQuestionOutputModel {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AllQuizQuestionsOutputModel =
  AllEntitiesOutputModel<IQuizQuestionOutputModel>;
