import { IsString, Length } from 'class-validator';
import { MIN_STRINGS_LENGTH, postsConstants } from '../../../common/constants';
import { IsNotEmptyContent } from '../../../common/validators/is-not-empty-content.validator';

const { MAX_TITLE_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH, MAX_CONTENT_LENGTH } =
  postsConstants;

export class CreatePostForBlogDto {
  @Length(MIN_STRINGS_LENGTH, MAX_TITLE_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly title: string;

  @Length(MIN_STRINGS_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly shortDescription: string;

  @Length(MIN_STRINGS_LENGTH, MAX_CONTENT_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly content: string;
}
