import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { QuizGameStatus } from '../../../common/enums';

@Entity({ name: 'game' })
export class QuizGameEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  firstPlayerId: string;

  @Column({ type: 'uuid' })
  secondPlayerId: string;

  @Column({ type: 'integer', default: 0 })
  firstPlayerScore: number;

  @Column({ type: 'integer', default: 0 })
  secondPlayerScore: number;

  @Column({
    type: 'enum',
    enum: QuizGameStatus,
    default: QuizGameStatus.PENDING_SECOND_PLAYER,
  })
  status: QuizGameStatus;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  startGameDate: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  finishGameDate: Date;
}
