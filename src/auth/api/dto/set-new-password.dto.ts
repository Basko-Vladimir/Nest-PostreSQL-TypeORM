import { IsNotEmpty, IsString, Length } from 'class-validator';
import { IsNotEmptyContent } from '../../../common/validators/is-not-empty-content.validator';
import { usersConstants } from '../../../common/constants';

const { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } = usersConstants;

export class SetNewPasswordDto {
  @Length(MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly newPassword: string;

  @IsNotEmpty()
  @IsString()
  readonly recoveryCode: string;
}
