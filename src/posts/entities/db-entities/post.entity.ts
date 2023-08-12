import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/common-db-entities';
import { postsConstants } from '../../../common/constants';
import { BlogEntity } from '../../../blogs/entities/db-entities/blog.entity';
import { CommentEntity } from '../../../comments/entities/db-entities/comment.entity';
import { LikeEntity } from '../../../likes/entities/db-entities/like.entity';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { FileUploadingEntity } from '../../../files-uploading/entities/file-uploading.entity';
import { GameUserEntity } from '../../../quiz/games/entities/game-user.entity';

const { MAX_TITLE_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH, MAX_CONTENT_LENGTH } =
  postsConstants;

@Entity({ name: 'post' })
export class PostEntity extends BaseEntity {
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

  @OneToMany(() => CommentEntity, (commentEntity) => commentEntity.post)
  comments: CommentEntity[];

  @OneToMany(() => LikeEntity, (likeEntity) => likeEntity.post)
  likes: LikeEntity[];

  @ManyToOne(() => BlogEntity, (blogEntity) => blogEntity.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'blogId' })
  blog: BlogEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(
    () => FileUploadingEntity,
    (uploadedFileEntity) => uploadedFileEntity.post,
  )
  uploadedFiles: GameUserEntity[];
}
