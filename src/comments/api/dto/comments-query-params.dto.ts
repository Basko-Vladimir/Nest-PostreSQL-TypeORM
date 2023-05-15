import { CommentSortByField } from '../../../common/enums';
import { CommonQueryParamsDto } from '../../../common/common.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class CommentsQueryParamsDto extends CommonQueryParamsDto {
  @IsOptional()
  @IsEnum(CommentSortByField)
  readonly sortBy: CommentSortByField = CommentSortByField.createdAt;
}
