import { Injectable } from '@nestjs/common';
import {
  AllQuizQuestionsOutputModel,
  IQuizQuestionOutputModel,
} from '../api/dto/quiz-questions-output-models.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quiz-question.entity';
import { Repository } from 'typeorm';
import { mapQuizQuestionEntityToQuizQuestionOutputModel } from '../mappers/quiz-questions.mapper';
import { QuizQuestionsQueryParamsDto } from '../api/dto/quiz-questions-query-params.dto';
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '../../../common/constants';
import {
  PublishedStatus,
  QuizQuestionsSortByField,
  SortDirection,
} from '../../../common/enums';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../../common/utils';

@Injectable()
export class QueryAdminQuizQuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private typeOrmQuizQuestionsRepository: Repository<QuizQuestionEntity>,
  ) {}

  async findAllQuizQuestions(
    queryParams: QuizQuestionsQueryParamsDto,
  ): Promise<AllQuizQuestionsOutputModel> {
    const {
      bodySearchTerm = '',
      pageNumber = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
      sortBy = QuizQuestionsSortByField.createdAt,
      sortDirection = SortDirection.desc,
      publishedStatus = PublishedStatus.ALL,
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const dbSortDirection = getDbSortDirection(sortDirection);
    const selectQueryBuilder = this.typeOrmQuizQuestionsRepository
      .createQueryBuilder('question')
      .select();

    if (bodySearchTerm) {
      selectQueryBuilder.where('question.body ilike :bodySearchTerm', {
        bodySearchTerm: `%${bodySearchTerm}%`,
      });
    }
    if (
      publishedStatus === PublishedStatus.PUBLISHED ||
      publishedStatus === PublishedStatus.NOT_PUBLISHED
    ) {
      selectQueryBuilder.andWhere('question.isPublished = :isBanned', {
        isBanned: publishedStatus === PublishedStatus.PUBLISHED,
      });
    }

    const totalCount = await selectQueryBuilder.getCount();
    const questions = await selectQueryBuilder
      .orderBy(`question.${sortBy}`, dbSortDirection)
      .take(pageSize)
      .skip(skip)
      .getMany();

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: questions.map(mapQuizQuestionEntityToQuizQuestionOutputModel),
    };
  }

  async findQuizQuestionById(
    questionId: string,
  ): Promise<IQuizQuestionOutputModel> {
    const question = await this.typeOrmQuizQuestionsRepository
      .createQueryBuilder('question')
      .select('question')
      .where('question.id = :questionId', { questionId })
      .getOne();

    return mapQuizQuestionEntityToQuizQuestionOutputModel(question);
  }
}
