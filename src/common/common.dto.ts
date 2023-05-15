import { ICommonQueryParams } from './types';
import { IsEnum, IsOptional, Min } from 'class-validator';
import { SortDirection } from './enums';
import { Type } from 'class-transformer';

export class CommonQueryParamsDto implements ICommonQueryParams {
  @IsEnum(SortDirection)
  @IsOptional()
  readonly sortDirection: SortDirection = SortDirection.desc;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  readonly pageNumber: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  readonly pageSize: number = 10;
}
