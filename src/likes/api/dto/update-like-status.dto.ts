import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../../common/enums';

export class UpdateLikeStatusDto {
  @IsEnum(LikeStatus)
  readonly likeStatus: LikeStatus;
}
