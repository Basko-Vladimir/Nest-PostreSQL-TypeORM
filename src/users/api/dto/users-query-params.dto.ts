import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BanStatus, UserSortByField } from '../../../common/enums';
import { CommonQueryParamsDto } from '../../../common/common.dto';

export class UsersQueryParamsDto extends CommonQueryParamsDto {
  @IsOptional()
  @IsEnum(UserSortByField)
  readonly sortBy: UserSortByField = UserSortByField.createdAt;

  @IsOptional()
  @IsString()
  readonly searchLoginTerm: string = '';

  @IsOptional()
  @IsString()
  readonly searchEmailTerm: string = '';

  @IsOptional()
  @IsEnum(BanStatus)
  readonly banStatus: BanStatus = BanStatus.ALL;
}
