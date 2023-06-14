import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'gameQuestion' })
export class GameQuestionEntity {
  @PrimaryColumn({ type: 'uuid' })
  gameId: string;

  @PrimaryColumn({ type: 'uuid' })
  questionId: string;
}
