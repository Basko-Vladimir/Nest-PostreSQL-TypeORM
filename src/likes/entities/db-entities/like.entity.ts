import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { LikeStatus } from '../../../common/enums';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { PostEntity } from '../../../posts/entities/db-entities/post.entity';
import { CommentEntity } from '../../../comments/entities/db-entities/comment.entity';

@Entity({ name: 'like' })
export class LikeEntity extends BaseEntity {
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

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.likes)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (postEntity) => postEntity.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;

  @ManyToOne(() => CommentEntity, (commentEntity) => commentEntity.likes)
  @JoinColumn({ name: 'commentId' })
  comment: CommentEntity;
}
