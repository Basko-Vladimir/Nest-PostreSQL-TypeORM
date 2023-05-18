import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'emailConfirmation' })
export class EmailConfirmationEntity {
  @PrimaryColumn()
  userId: string;

  @Column()
  confirmationCode: string;

  @Column()
  isConfirmed: boolean;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  @OneToOne(() => UserEntity, (dbUser) => dbUser.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
