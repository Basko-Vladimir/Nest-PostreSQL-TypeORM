import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { QuizGameEntity } from './quiz-game.entity';
import { BaseEntity } from '../../../common/common-db-entities';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { PlayerNumber } from '../../../common/enums';

@Entity({ name: 'gameUser' })
export class GameUserEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  gameId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'integer', default: 0 })
  score: number;

  @Column({
    type: 'enum',
    enum: PlayerNumber,
  })
  playerNumber: PlayerNumber;

  @ManyToOne(() => QuizGameEntity, (gameUserEntity) => gameUserEntity.gameUsers)
  @JoinColumn({ name: 'gameId' })
  game: QuizGameEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.gameUsers)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
