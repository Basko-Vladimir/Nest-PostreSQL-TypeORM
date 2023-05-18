import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { LikeStatus } from '../../../common/enums';
import { User } from '../../../users/entities/db-entities/user.entity';
import { DbPost } from '../../../posts/entities/db-entities/post.entity';
import { DbComment } from '../../../comments/entities/db-entities/comment.entity';

@Entity({ name: 'like' })
export class DbLike extends BaseEntity {
  @Column({
    type: 'enum',
    enum: LikeStatus,
  })
  status: LikeStatus;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  postId: string;

  @Column({
    type: 'uuid',
    nullable: true,
    default: null,
  })
  commentId: string;

  @ManyToOne(() => User, (dbUser) => dbUser.likes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => DbPost, (dbPost) => dbPost.likes)
  @JoinColumn({ name: 'postId' })
  post: DbPost;

  @ManyToOne(() => DbComment, (dbComment) => dbComment.likes)
  @JoinColumn({ name: 'commentId' })
  comment: DbComment;
}
