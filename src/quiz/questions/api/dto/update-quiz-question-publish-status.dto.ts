import { IsBoolean } from 'class-validator';

export class UpdateQuizQuestionPublishStatusDto {
  @IsBoolean()
  published: boolean;
}
