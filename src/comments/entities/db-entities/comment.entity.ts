import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { commentsConstants } from '../../../common/constants';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { PostEntity } from '../../../posts/entities/db-entities/post.entity';
import { LikeEntity } from '../../../likes/entities/db-entities/like.entity';

const { MAX_CONTENT_LENGTH } = commentsConstants;

@Entity({ name: 'comment' })
export class CommentEntity extends BaseEntity {
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

  @OneToMany(() => LikeEntity, (likeEntity) => likeEntity.comment)
  likes: LikeEntity[];

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (postEntity) => postEntity.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: PostEntity;
}
