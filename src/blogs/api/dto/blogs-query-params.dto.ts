import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommonQueryParamsDto } from '../../../common/common.dto';
import { BlogSortByField } from '../../../common/enums';

export class BlogsQueryParamsDto extends CommonQueryParamsDto {
  @IsOptional()
  @IsEnum(BlogSortByField)
  readonly sortBy: BlogSortByField = BlogSortByField.createdAt;

  @IsOptional()
  @IsString()
  readonly searchNameTerm: string = '';
}
