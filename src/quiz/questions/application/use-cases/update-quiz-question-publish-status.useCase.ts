import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizQuestionsRepository } from '../../infrastructure/quiz-questions.repository';

export class UpdateQuizQuestionPublishStatusCommand {
  constructor(public questionId: string, public isPublished: boolean) {}
}

@CommandHandler(UpdateQuizQuestionPublishStatusCommand)
export class UpdateQuizQuestionPublishStatusUseCase
  implements ICommandHandler<UpdateQuizQuestionPublishStatusCommand>
{
  constructor(private quizQuestionsRepository: QuizQuestionsRepository) {}

  execute(command: UpdateQuizQuestionPublishStatusCommand): Promise<void> {
    const { questionId, isPublished } = command;

    return this.quizQuestionsRepository.updateQuizQuestionPublishStatus(
      questionId,
      isPublished,
    );
  }
}
