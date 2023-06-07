import { ArrayMinSize, IsArray, IsString, Length } from 'class-validator';
import { quizQuestions } from '../../../../common/constants';
import { IsNotEmptyContent } from '../../../../common/validators/is-not-empty-content.validator';

const { MIN_BODY_LENGTH, MAX_BODY_LENGTH } = quizQuestions;

export class CreateQuizQuestionDto {
  @Length(MIN_BODY_LENGTH, MAX_BODY_LENGTH)
  @IsNotEmptyContent()
  @IsString()
  readonly body: string;

  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsArray()
  readonly correctAnswers: string[];
}
