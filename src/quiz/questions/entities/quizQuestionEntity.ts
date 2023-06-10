import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGameEntity } from '../../games/entities/quiz-game.entity';

@Entity({ name: 'question' })
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true, default: null })
  body: string;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'json', nullable: null, default: null })
  answers: string;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(
    () => QuizGameEntity,
    (quizGameEntity) => quizGameEntity.questions,
    { eager: true },
  )
  @JoinTable()
  games: QuizGameEntity[];
}
