import { CommonQueryParamsDto } from '../../../../common/common.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { QuizGameSortByField } from '../../../../common/enums';

export class QuizGamesQueryParamsDto extends CommonQueryParamsDto {
  @IsOptional()
  @IsEnum(QuizGameSortByField)
  readonly sortBy: QuizGameSortByField = QuizGameSortByField.pairCreatedDate;
}
