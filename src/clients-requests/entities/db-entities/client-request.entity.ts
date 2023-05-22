import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';

@Entity({ name: 'clientRequest' })
export class ClientRequestEntity extends BaseEntity {
  @Column({ type: 'text' })
  endpoint: string;

  @Column({ type: 'varchar', length: 20 })
  ip: string;

  @Column({ type: 'bigint' })
  createTimeStamp: number;
}
