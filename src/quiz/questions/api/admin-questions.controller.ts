import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../common/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { IQuizQuestionOutputModel } from './dto/quiz-questions-output-models.dto';
import { CreateQuizQuestionCommand } from '../application/use-cases/create-quiz-question.useCase';
import { QueryQuizQuestionsRepository } from '../infrastructure/query-quiz-quetions.repository';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class AdminQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private queryQuizQuestionsRepository: QueryQuizQuestionsRepository,
  ) {}

  @Post()
  async createQuizQuestion(
    @Body() createQuizQuestionDto: CreateQuizQuestionDto,
  ): Promise<IQuizQuestionOutputModel> {
    const createdQuestionId = await this.commandBus.execute(
      new CreateQuizQuestionCommand(createQuizQuestionDto),
    );

    return this.queryQuizQuestionsRepository.findQuizQuestionById(
      createdQuestionId,
    );
  }
}
