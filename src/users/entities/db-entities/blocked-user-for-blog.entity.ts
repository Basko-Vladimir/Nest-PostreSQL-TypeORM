import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { DbUser } from './user.entity';
import { DbBlog } from '../../../blogs/entities/db-entities/blog.entity';

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

  @ManyToOne(() => DbUser, (dbUser) => dbUser.blockedUsersForBlog)
  @JoinColumn({ name: 'userId' })
  user: DbUser;

  @ManyToOne(() => DbBlog, (dbBlog) => dbBlog.blockedUsersForBlog)
  @JoinColumn({ name: 'blogId' })
  blog: DbBlog;
}
