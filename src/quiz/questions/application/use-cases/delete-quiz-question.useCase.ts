import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizAdminQuestionsRepository } from '../../infrastructure/quiz-admin-questions.repository';

export class DeleteQuizQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuizQuestionCommand)
export class DeleteQuizQuestionUseCase
  implements ICommandHandler<DeleteQuizQuestionCommand>
{
  constructor(private quizQuestionRepository: QuizAdminQuestionsRepository) {}

  execute(command: DeleteQuizQuestionCommand): Promise<void> {
    const { questionId } = command;

    return this.quizQuestionRepository.deleteQuizQuestion(questionId);
  }
}
