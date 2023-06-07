import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';

export class DeleteQuizQuestionCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuizQuestionCommand)
export class DeleteQuizQuestionUseCase
  implements ICommandHandler<DeleteQuizQuestionCommand>
{
  constructor(private quizQuestionRepository: QuizQuestionsRepository) {}

  execute(command: DeleteQuizQuestionCommand): Promise<void> {
    const { questionId } = command;

    return this.quizQuestionRepository.deleteQuizQuestion(questionId);
  }
}
