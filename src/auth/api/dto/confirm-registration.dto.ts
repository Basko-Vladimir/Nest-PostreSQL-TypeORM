import { IsUUID } from 'class-validator';

export class ConfirmRegistrationDto {
  @IsUUID()
  readonly code: string;
}
