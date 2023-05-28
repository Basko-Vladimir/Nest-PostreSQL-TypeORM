import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BlogEntity } from '../../../blogs/entities/db-entities/blog.entity';

@Entity({ name: 'blockedUserForBlog' })
export class DbBlockedUserForBlog {
  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @PrimaryColumn({ type: 'uuid' })
  blogId: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isBanned: boolean;

  @Column({ type: 'text', default: null, nullable: true })
  banReason: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  banDate: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.blockedUsersForBlog)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => BlogEntity, (blogEntity) => blogEntity.blockedUsersForBlog)
  @JoinColumn({ name: 'blogId' })
  blog: BlogEntity;
}
