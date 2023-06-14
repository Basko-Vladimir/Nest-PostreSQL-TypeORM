import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizAdminQuestionsRepository } from '../../infrastructure/quiz-admin-questions.repository';

export class UpdateQuizQuestionPublishStatusCommand {
  constructor(public questionId: string, public isPublished: boolean) {}
}

@CommandHandler(UpdateQuizQuestionPublishStatusCommand)
export class UpdateQuizQuestionPublishStatusUseCase
  implements ICommandHandler<UpdateQuizQuestionPublishStatusCommand>
{
  constructor(private quizQuestionsRepository: QuizAdminQuestionsRepository) {}

  execute(command: UpdateQuizQuestionPublishStatusCommand): Promise<void> {
    const { questionId, isPublished } = command;

    return this.quizQuestionsRepository.updateQuizQuestionPublishStatus(
      questionId,
      isPublished,
    );
  }
}
