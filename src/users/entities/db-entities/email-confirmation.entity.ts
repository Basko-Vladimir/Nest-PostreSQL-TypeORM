import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'emailConfirmation' })
export class EmailConfirmationEntity {
  @PrimaryColumn()
  userId: string;

  @Column({ type: 'uuid' })
  confirmationCode: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isConfirmed: boolean;

  @Column({ type: 'timestamp', nullable: true, default: null })
  expirationDate: Date;

  @OneToOne(() => UserEntity, (userEntity) => userEntity.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
