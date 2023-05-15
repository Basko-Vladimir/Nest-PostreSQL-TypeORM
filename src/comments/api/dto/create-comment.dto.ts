import { IsString, IsUUID, Length, Matches } from 'class-validator';
import { commentsConstants, usersConstants } from '../../../common/constants';
import { IsNotEmptyContent } from '../../../common/validators/is-not-empty-content.validator';

const { MIN_CONTENT_LENGTH, MAX_CONTENT_LENGTH } = commentsConstants;
const { MIN_LOGIN_LENGTH, MAX_LOGIN_LENGTH, LOGIN_REG_EXP } = usersConstants;

export class CreateCommentDto {
  @Length(MIN_CONTENT_LENGTH, MAX_CONTENT_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly content: string;

  @IsUUID()
  readonly postId: string;

  @IsUUID()
  readonly userId: string;

  @Length(MIN_LOGIN_LENGTH, MAX_LOGIN_LENGTH)
  @Matches(LOGIN_REG_EXP)
  @IsNotEmptyContent()
  @IsString()
  readonly userLogin: string;
}
