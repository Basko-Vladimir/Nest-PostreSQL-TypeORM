import { IsEmail, IsString } from 'class-validator';

export class EmailDto {
  @IsEmail()
  @IsString()
  readonly email: string;
}
