import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';

@Entity({ name: 'clientRequest' })
export class DbClientRequest extends BaseEntity {
  @Column()
  endpoint: string;

  @Column()
  ip: string;

  @Column({ type: 'bigint' })
  createTimeStamp: number;
}
