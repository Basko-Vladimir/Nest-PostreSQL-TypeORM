import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../common/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import {
  AllQuizQuestionsOutputModel,
  IQuizQuestionOutputModel,
} from './dto/quiz-questions-output-models.dto';
import { CreateQuizQuestionCommand } from '../application/use-cases/create-quiz-question.useCase';
import { QueryAdminQuizQuestionsRepository } from '../infrastructure/query-admin-quiz-quetions.repository';
import { CheckExistingEntityGuard } from '../../../common/guards/check-existing-entity.guard';
import { ParamIdType } from '../../../common/decorators/param-id-type.decorator';
import { IdTypes } from '../../../common/enums';
import { DeleteQuizQuestionCommand } from '../application/use-cases/delete-quiz-question.useCase';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { UpdateQuizQuestionCommand } from '../application/use-cases/update-quiz-question.useCase';
import { UpdateQuizQuestionPublishStatusCommand } from '../application/use-cases/update-quiz-question-publish-status.useCase';
import { UpdateQuizQuestionPublishStatusDto } from './dto/update-quiz-question-publish-status.dto';
import { QuizQuestionsQueryParamsDto } from './dto/quiz-questions-query-params.dto';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class AdminQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private queryQuizQuestionsRepository: QueryAdminQuizQuestionsRepository,
  ) {}

  @Get()
  async findAllQuizQuestions(
    @Query() query: QuizQuestionsQueryParamsDto,
  ): Promise<AllQuizQuestionsOutputModel> {
    return this.queryQuizQuestionsRepository.findAllQuizQuestions(query);
  }

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

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.QUIZ_QUESTION_ID])
  @UseGuards(CheckExistingEntityGuard)
  async updateQuizQuestion(
    @Param('id') questionId: string,
    @Body() updateQuizQuestionDto: UpdateQuizQuestionDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateQuizQuestionCommand(questionId, updateQuizQuestionDto),
    );
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.QUIZ_QUESTION_ID])
  @UseGuards(CheckExistingEntityGuard)
  async updateQuizQuestionPublishStatus(
    @Param('id') questionId: string,
    @Body()
    updateQuizQuestionPublishStatusDto: UpdateQuizQuestionPublishStatusDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateQuizQuestionPublishStatusCommand(
        questionId,
        updateQuizQuestionPublishStatusDto.published,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.QUIZ_QUESTION_ID])
  @UseGuards(CheckExistingEntityGuard)
  async deleteQuizQuestion(@Param('id') questionId: string): Promise<void> {
    return this.commandBus.execute(new DeleteQuizQuestionCommand(questionId));
  }
}
