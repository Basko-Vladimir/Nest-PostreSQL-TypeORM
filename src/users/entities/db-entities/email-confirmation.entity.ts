import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'emailConfirmation' })
export class DbEmailConfirmation {
  @PrimaryColumn()
  userId: string;

  @Column()
  confirmationCode: string;

  @Column()
  isConfirmed: boolean;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  @OneToOne(() => User, (dbUser) => dbUser.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
