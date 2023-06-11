import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { QuizGameStatus } from '../../../common/enums';
import { QuizQuestionEntity } from '../../questions/entities/quiz-question.entity';
import { QuizAnswerEntity } from '../../answers/entities/quiz-answer.entity';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';

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

  @OneToMany(
    () => QuizAnswerEntity,
    (quizAnswerEntity) => quizAnswerEntity.game,
  )
  answers: QuizAnswerEntity[];

  @ManyToMany(
    () => QuizQuestionEntity,
    (quizQuestionEntity) => quizQuestionEntity.games,
  )
  questions: QuizQuestionEntity[];

  @ManyToMany(() => UserEntity, (userEntity) => userEntity.games)
  @JoinTable()
  users: UserEntity[];
}
