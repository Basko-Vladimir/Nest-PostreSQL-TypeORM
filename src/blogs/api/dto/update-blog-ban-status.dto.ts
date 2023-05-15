import { IsBoolean } from 'class-validator';

export class UpdateBlogBanStatusDto {
  @IsBoolean()
  readonly isBanned: boolean;
}
