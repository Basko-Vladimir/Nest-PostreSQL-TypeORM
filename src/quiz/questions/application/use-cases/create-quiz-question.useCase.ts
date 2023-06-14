import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuizQuestionDto } from '../../api/dto/create-quiz-question.dto';
import { QuizAdminQuestionsRepository } from '../../infrastructure/quiz-admin-questions.repository';

export class CreateQuizQuestionCommand {
  constructor(public createQuizQuestionDto: CreateQuizQuestionDto) {}
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionUseCase
  implements ICommandHandler<CreateQuizQuestionCommand>
{
  constructor(private quizQuestionRepository: QuizAdminQuestionsRepository) {}

  async execute(command: CreateQuizQuestionCommand): Promise<string> {
    const { correctAnswers, body } = command.createQuizQuestionDto;
    const jsonCorrectAnswers = JSON.stringify(correctAnswers);

    return this.quizQuestionRepository.createQuizQuestion(
      body,
      jsonCorrectAnswers,
    );
  }
}
