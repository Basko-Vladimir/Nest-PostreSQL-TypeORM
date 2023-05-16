import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { DbEmailConfirmation } from './email-confirmation.entity';
import { DbDeviceSession } from '../../../devices-sessions/entities/db-entities/device-session.entity';
import { DbBlog } from '../../../blogs/entities/db-entities/blog.entity';
import { BlockableEntity } from '../../../common/common-db-entities';
import { DbBlockedUserForBlog } from './blocked-user-for-blog.entity';
import { DbComment } from '../../../comments/entities/db-entities/comment.entity';
import { DbLike } from '../../../likes/entities/db-entities/like.entity';
import { DbPost } from '../../../posts/entities/db-entities/post.entity';
import { usersConstants } from '../../../common/constants';

const {
  MAX_LOGIN_LENGTH,
  LOGIN_REG_EXP,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} = usersConstants;

@Entity({ name: 'user' })
export class DbUser extends BlockableEntity {
  @Column({
    type: 'varchar',
    length: MAX_LOGIN_LENGTH,
  })
  login: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  passwordHash: string;

  @Column({ default: null, nullable: true })
  passwordRecoveryCode: string;

  @Column({ default: null, nullable: true })
  banReason: string;

  @OneToOne(
    () => DbEmailConfirmation,
    (dbEmailConfirmation) => dbEmailConfirmation.user,
  )
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
