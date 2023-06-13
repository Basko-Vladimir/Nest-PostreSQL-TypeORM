import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizAdminQuestionsRepository } from '../../infrastructure/quiz-admin-questions.repository';
import { UpdateQuizQuestionDto } from '../../api/dto/update-quiz-question.dto';

export class UpdateQuizQuestionCommand {
  constructor(
    public questionId: string,
    public updateQuizQuestionDto: UpdateQuizQuestionDto,
  ) {}
}

@CommandHandler(UpdateQuizQuestionCommand)
export class UpdateQuizQuestionUseCase
  implements ICommandHandler<UpdateQuizQuestionCommand>
{
  constructor(private quizQuestionsRepository: QuizAdminQuestionsRepository) {}

  execute(command: UpdateQuizQuestionCommand): Promise<void> {
    const {
      questionId,
      updateQuizQuestionDto: { correctAnswers, body },
    } = command;
    const jsonCorrectAnswers = JSON.stringify(correctAnswers);

    return this.quizQuestionsRepository.updateQuizQuestion(
      questionId,
      body,
      jsonCorrectAnswers,
    );
  }
}
