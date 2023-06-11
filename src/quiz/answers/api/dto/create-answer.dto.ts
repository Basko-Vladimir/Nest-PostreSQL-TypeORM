import { IsString } from 'class-validator';
import { IsNotEmptyContent } from '../../../../common/validators/is-not-empty-content.validator';

export class CreateAnswerDto {
  @IsNotEmptyContent()
  @IsString()
  answer: string;
}
