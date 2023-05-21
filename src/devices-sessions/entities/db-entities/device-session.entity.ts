import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { BaseEntity } from '../../../common/common-db-entities';

@Entity({ name: 'deviceSession' })
export class DeviceSessionEntity extends BaseEntity {
  @Column({ type: 'integer' })
  issuedAt: number;

  @Column({ type: 'integer' })
  expiredDate: number;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'text' })
  deviceName: string;

  @Column({ type: 'varchar', length: 20 })
  ip: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.deviceSession, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
