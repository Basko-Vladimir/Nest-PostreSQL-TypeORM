import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommonQueryParamsDto } from '../../../common/common.dto';
import { UserSortByField } from '../../../common/enums';

export class BannedUsersForSpecificBlogQueryParamsDto extends CommonQueryParamsDto {
  @IsOptional()
  @IsEnum(UserSortByField)
  readonly sortBy: string = UserSortByField.createdAt;

  @IsOptional()
  @IsString()
  readonly searchLoginTerm: string = '';
}
