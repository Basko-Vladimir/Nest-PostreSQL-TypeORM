import { QuizAnswerEntity } from '../entities/quiz-answer.entity';
import { IAnswerOutputModel } from '../api/dto/answer-output-models.dto';

export const mapQuizAnswerEntityToQuizAnswerOutputModel = (
  answer: QuizAnswerEntity,
): IAnswerOutputModel => ({
  questionId: answer.questionId,
  answerStatus: answer.status,
  addedAt: answer.createdAt.toISOString(),
});
