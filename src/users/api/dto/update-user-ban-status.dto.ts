import { IsBoolean, IsString, MinLength } from 'class-validator';
import { IsNotEmptyContent } from '../../../common/validators/is-not-empty-content.validator';
import { usersConstants } from '../../../common/constants';

const { MIN_BAN_REASON_LENGTH } = usersConstants;

export class UpdateUserBanStatusDto {
  @IsBoolean()
  readonly isBanned: boolean;

  @MinLength(MIN_BAN_REASON_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly banReason: string;
}
