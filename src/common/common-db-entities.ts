import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export class BlockableEntity extends BaseEntity {
  @Column({
    type: 'boolean',
    default: false,
  })
  isBanned: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  banDate: Date;
}
