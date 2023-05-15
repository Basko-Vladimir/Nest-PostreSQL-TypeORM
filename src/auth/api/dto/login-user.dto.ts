import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  readonly loginOrEmail: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
