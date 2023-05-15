import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { blogsConstants, MIN_STRINGS_LENGTH } from '../../../common/constants';
import { IsNotEmptyContent } from '../../../common/validators/is-not-empty-content.validator';

const {
  MAX_NAME_LENGTH,
  MAX_WEBSITE_URL_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  WEBSITE_URL_REG_EXP,
} = blogsConstants;

export class CreateBlogDto {
  @Length(MIN_STRINGS_LENGTH, MAX_NAME_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly name: string;

  @MaxLength(MAX_WEBSITE_URL_LENGTH)
  @Matches(WEBSITE_URL_REG_EXP)
  @IsNotEmptyContent()
  @IsNotEmpty()
  @IsString()
  readonly websiteUrl: string;

  @Length(MIN_STRINGS_LENGTH, MAX_DESCRIPTION_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly description: string;
}
