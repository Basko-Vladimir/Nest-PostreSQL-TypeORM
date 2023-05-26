import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { postsConstants } from '../../../common/constants';
import { BlogEntity } from '../../../blogs/entities/db-entities/blog.entity';
import { DbComment } from '../../../comments/entities/db-entities/comment.entity';
import { DbLike } from '../../../likes/entities/db-entities/like.entity';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';

const { MAX_TITLE_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH, MAX_CONTENT_LENGTH } =
  postsConstants;

@Entity({ name: 'post' })
export class DbPost extends BaseEntity {
  @Column({
    type: 'varchar',
    length: MAX_TITLE_LENGTH,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: MAX_SHORT_DESCRIPTION_LENGTH,
  })
  shortDescription: string;

  @Column({
    type: 'varchar',
    length: MAX_CONTENT_LENGTH,
  })
  content: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToMany(() => DbComment, (dbComment) => dbComment.post)
  comments: DbComment[];

  @OneToMany(() => DbLike, (dbLike) => dbLike.post)
  likes: DbLike[];

  @ManyToOne(() => BlogEntity, (blogEntity) => blogEntity.posts)
  @JoinColumn({ name: 'blogId' })
  blog: BlogEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.posts)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
