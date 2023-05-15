import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { blogsConstants } from '../../../common/constants';
import { DbUser } from '../../../users/entities/db-entities/user.entity';
import { BlockableEntity } from '../../../common/common-db-entities';
import { DbPost } from '../../../posts/entities/db-entities/post.entity';
import { DbBlockedUserForBlog } from '../../../users/entities/db-entities/blocked-user-for-blog.entity';

const { MAX_NAME_LENGTH, MAX_WEBSITE_URL_LENGTH, MAX_DESCRIPTION_LENGTH } =
  blogsConstants;

@Entity({ name: 'blog' })
export class DbBlog extends BlockableEntity {
  @Column({
    type: 'varchar',
    length: MAX_NAME_LENGTH,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: MAX_WEBSITE_URL_LENGTH,
  })
  websiteUrl: string;

  @Column({
    type: 'varchar',
    length: MAX_DESCRIPTION_LENGTH,
  })
  description: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isMembership: boolean;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => DbUser, (dbUser) => dbUser.blogs)
  @JoinColumn({ name: 'ownerId' })
  user: DbUser;

  @OneToMany(() => DbPost, (dbPost) => dbPost.blog)
  posts: DbPost[];

  @OneToMany(
    () => DbBlockedUserForBlog,
    (dbBlockedUserForBlog) => dbBlockedUserForBlog.blog,
  )
  blockedUsersForBlog: DbBlockedUserForBlog[];
}
