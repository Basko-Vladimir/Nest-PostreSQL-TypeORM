import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { commentsConstants } from '../../../common/constants';
import { DbUser } from '../../../users/entities/db-entities/user.entity';
import { DbPost } from '../../../posts/entities/db-entities/post.entity';
import { DbLike } from '../../../likes/entities/db-entities/like.entity';

const { MAX_CONTENT_LENGTH } = commentsConstants;

@Entity({ name: 'comment' })
export class DbComment extends BaseEntity {
  @Column({
    type: 'varchar',
    length: MAX_CONTENT_LENGTH,
  })
  content: string;

  @Column({
    type: 'uuid',
  })
  authorId: string;

  @Column({
    type: 'uuid',
  })
  postId: string;

  @OneToMany(() => DbLike, (dbLike) => dbLike.comment)
  likes: DbLike[];

  @ManyToOne(() => DbUser, (dbUser) => dbUser.comments)
  @JoinColumn({ name: 'authorId' })
  user: DbUser;

  @ManyToOne(() => DbPost, (dbPost) => dbPost.comments)
  @JoinColumn({ name: 'postId' })
  post: DbPost;
}
