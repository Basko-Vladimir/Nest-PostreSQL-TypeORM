import { IsString, Length, Matches } from 'class-validator';
import { usersConstants } from '../../../common/constants';
import { IsNotEmptyContent } from '../../../common/validators/is-not-empty-content.validator';
import { EmailDto } from '../../../auth/api/dto/email.dto';

const {
  MIN_LOGIN_LENGTH,
  MAX_LOGIN_LENGTH,
  LOGIN_REG_EXP,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} = usersConstants;

export class CreateUserDto extends EmailDto {
  @Length(MIN_LOGIN_LENGTH, MAX_LOGIN_LENGTH)
  @Matches(LOGIN_REG_EXP)
  @IsNotEmptyContent()
  @IsString()
  readonly login: string;

  @Length(MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly password: string;
}
