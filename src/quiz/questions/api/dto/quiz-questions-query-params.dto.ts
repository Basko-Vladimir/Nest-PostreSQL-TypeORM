import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommonQueryParamsDto } from '../../../../common/common.dto';
import {
  PublishedStatus,
  QuizQuestionsSortByField,
} from '../../../../common/enums';

export class QuizQuestionsQueryParamsDto extends CommonQueryParamsDto {
  @IsOptional()
  @IsEnum(QuizQuestionsSortByField)
  readonly sortBy: QuizQuestionsSortByField =
    QuizQuestionsSortByField.createdAt;

  @IsOptional()
  @IsString()
  readonly bodySearchTerm: string = '';

  @IsOptional()
  @IsString()
  readonly searchEmailTerm: string = '';

  @IsOptional()
  @IsEnum(PublishedStatus)
  readonly publishedStatus: PublishedStatus = PublishedStatus.ALL;
}
