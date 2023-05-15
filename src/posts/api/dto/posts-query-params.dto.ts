import { CommonQueryParamsDto } from '../../../common/common.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { PostSortByField } from '../../../common/enums';

export class PostsQueryParamsDto extends CommonQueryParamsDto {
  @IsOptional()
  @IsEnum(PostSortByField)
  readonly sortBy: PostSortByField = PostSortByField.createdAt;
}
