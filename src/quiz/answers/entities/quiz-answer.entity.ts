import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { AnswerStatus } from '../../../common/enums';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { QuizQuestionEntity } from '../../questions/entities/quiz-question.entity';
import { QuizGameEntity } from '../../games/entities/quiz-game.entity';

@Entity({ name: 'answer' })
export class QuizAnswerEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  gameId: string;

  @Column({ type: 'uuid' })
  playerId: string;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    type: 'enum',
    enum: AnswerStatus,
  })
  status: AnswerStatus;

  @ManyToOne(() => QuizGameEntity, (quizGameEntity) => quizGameEntity.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gameId' })
  game: QuizGameEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playerId' })
  user: UserEntity;

  @ManyToOne(
    () => QuizQuestionEntity,
    (quizQuestionEntity) => quizQuestionEntity.answers,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'questionId' })
  question: QuizQuestionEntity;
}
