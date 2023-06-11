import { QuizQuestionEntity } from '../entities/quiz-question.entity';
import { IQuizQuestionOutputModel } from '../api/dto/quiz-questions-output-models.dto';

export const mapQuizQuestionEntityToQuizQuestionOutputModel = (
  question: QuizQuestionEntity,
): IQuizQuestionOutputModel => {
  const correctAnswers: string[] = JSON.parse(question.correctAnswers);

  return {
    id: question.id,
    body: question.body,
    correctAnswers,
    published: question.isPublished,
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt?.toISOString() || null,
  };
};
