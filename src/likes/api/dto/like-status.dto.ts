import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../../common/enums';

export class LikeStatusDto {
  @IsEnum(LikeStatus)
  readonly likeStatus: LikeStatus;
}
