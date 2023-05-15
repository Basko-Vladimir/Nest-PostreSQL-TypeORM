import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { DbEmailConfirmation } from './email-confirmation.entity';
import { DbDeviceSession } from '../../../devices-sessions/entities/db-entities/device-session.entity';
import { DbBlog } from '../../../blogs/entities/db-entities/blog.entity';
import { BlockableEntity } from '../../../common/common-db-entities';
import { DbBlockedUserForBlog } from './blocked-user-for-blog.entity';
import { DbComment } from '../../../comments/entities/db-entities/comment.entity';
import { DbLike } from '../../../likes/entities/db-entities/like.entity';
import { DbPost } from '../../../posts/entities/db-entities/post.entity';

@Entity({ name: 'user' })
export class DbUser extends BlockableEntity {
  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  passwordRecoveryCode: string;

  @Column({ default: null, nullable: true })
  banReason: string;

  @OneToOne(() => DbEmailConfirmation)
  emailConfirmation: DbEmailConfirmation;

  @OneToMany(() => DbDeviceSession, (deviceSession) => deviceSession.user)
  deviceSession: DbDeviceSession[];

  @OneToMany(() => DbBlog, (dbBlog) => dbBlog.user)
  blogs: DbBlog[];

  @OneToMany(() => DbPost, (dbPost) => dbPost.user)
  posts: DbPost[];

  @OneToMany(
    () => DbBlockedUserForBlog,
    (dbBlockedUserForBlog) => dbBlockedUserForBlog.user,
  )
  blockedUsersForBlog: DbBlockedUserForBlog[];

  @OneToMany(() => DbComment, (dbComment) => dbComment.user)
  comments: DbComment[];

  @OneToMany(() => DbLike, (dbLike) => dbLike.user)
  likes: DbLike[];
}
