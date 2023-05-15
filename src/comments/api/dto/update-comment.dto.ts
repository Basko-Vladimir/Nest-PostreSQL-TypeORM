import { IsString, Length } from 'class-validator';
import { commentsConstants } from '../../../common/constants';
import { IsNotEmptyContent } from '../../../common/validators/is-not-empty-content.validator';

const { MIN_CONTENT_LENGTH, MAX_CONTENT_LENGTH } = commentsConstants;

export class UpdateCommentDto {
  @Length(MIN_CONTENT_LENGTH, MAX_CONTENT_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly content: string;
}
