import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { blogsConstants } from '../../../common/constants';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { BlockableEntity } from '../../../common/common-db-entities';
import { PostEntity } from '../../../posts/entities/db-entities/post.entity';
import { BannedUserForBlogEntity } from '../../../users/entities/db-entities/banned-user-for-blog.entity';

const { MAX_NAME_LENGTH, MAX_WEBSITE_URL_LENGTH, MAX_DESCRIPTION_LENGTH } =
  blogsConstants;

@Entity({ name: 'blog' })
export class BlogEntity extends BlockableEntity {
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

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.blogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  user: UserEntity;

  @OneToMany(() => PostEntity, (postEntity) => postEntity.blog)
  posts: PostEntity[];

  @OneToMany(
    () => BannedUserForBlogEntity,
    (bannedUserForBlogEntity) => bannedUserForBlogEntity.blog,
  )
  bannedUsersForBlog: BannedUserForBlogEntity[];
}
