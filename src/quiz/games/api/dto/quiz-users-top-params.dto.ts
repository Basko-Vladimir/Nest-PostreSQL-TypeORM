import { IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizUsersTopParamsDto {
  @IsOptional()
  readonly sort: string[];

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  readonly pageNumber: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  readonly pageSize: number = 10;
}
