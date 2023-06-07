import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';

@Entity({ name: 'question' })
export class QuestionEntity extends BaseEntity {
  @Column({ type: 'text', nullable: true, default: null })
  body;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'json', nullable: null, default: null })
  answers: string;
}
