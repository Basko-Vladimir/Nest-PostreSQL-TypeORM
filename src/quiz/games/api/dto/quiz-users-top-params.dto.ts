import { IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SortDirection, StatisticSortByField } from '../../../../common/enums';

export class QuizUsersTopParamsDto {
  @IsOptional()
  readonly sort: string | string[] = [
    `${StatisticSortByField.AVG_SCORES} ${SortDirection.desc}`,
    `${StatisticSortByField.SUM_SCORE} ${SortDirection.desc}`,
  ];

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  readonly pageNumber: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  readonly pageSize: number = 10;
}
