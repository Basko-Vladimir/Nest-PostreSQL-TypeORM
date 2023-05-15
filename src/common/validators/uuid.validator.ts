import { IsString, IsUUID } from 'class-validator';

export class IdValidator {
  @IsUUID()
  @IsString()
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}
