import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGameEntity } from '../../games/entities/quiz-game.entity';
import { QuizAnswerEntity } from '../../answers/entities/quiz-answer.entity';

@Entity({ name: 'question' })
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true, default: null })
  body: string;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'json', nullable: null, default: null })
  correctAnswers: string;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => QuizAnswerEntity,
    (quizAnswerEntity) => quizAnswerEntity.question,
  )
  answers: QuizAnswerEntity[];

  @ManyToMany(
    () => QuizGameEntity,
    (quizGameEntity) => quizGameEntity.questions,
  )
  games: QuizGameEntity[];
}
