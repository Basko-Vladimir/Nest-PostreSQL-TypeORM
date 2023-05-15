import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';
import { MIN_STRINGS_LENGTH, postsConstants } from '../../../common/constants';
import { IsNotEmptyContent } from '../../../common/validators/is-not-empty-content.validator';
import { IsExistEntity } from '../../../common/validators/is-exist-entity.validator';

const { MAX_TITLE_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH, MAX_CONTENT_LENGTH } =
  postsConstants;

export class CreatePostDto {
  @Length(MIN_STRINGS_LENGTH, MAX_TITLE_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly title: string;

  @Length(MIN_STRINGS_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  shortDescription: string;

  @Length(MIN_STRINGS_LENGTH, MAX_CONTENT_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  content: string;

  @IsExistEntity()
  @IsMongoId()
  @IsNotEmptyContent()
  @IsNotEmpty()
  blogId: string;
}
