import { IsUUID } from 'class-validator';
import { UpdateUserBanStatusDto } from './update-user-ban-status.dto';

export class UpdateUserBanStatusForBlogDto extends UpdateUserBanStatusDto {
  @IsUUID()
  readonly blogId: string;
}
