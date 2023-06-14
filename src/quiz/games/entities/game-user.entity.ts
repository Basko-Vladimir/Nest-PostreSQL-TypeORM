import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'gameUser' })
export class GameUserEntity {
  @PrimaryColumn({ type: 'uuid' })
  gameId: string;

  @PrimaryColumn({ type: 'uuid' })
  userId: string;
}
