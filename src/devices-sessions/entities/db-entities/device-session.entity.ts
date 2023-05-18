import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../../users/entities/db-entities/user.entity';
import { BaseEntity } from '../../../common/common-db-entities';

@Entity({ name: 'deviceSession' })
export class DbDeviceSession extends BaseEntity {
  @Column()
  issuedAt: number;

  @Column()
  expiredDate: number;

  @Column('uuid')
  deviceId: string;

  @Column()
  deviceName: string;

  @Column()
  ip: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
