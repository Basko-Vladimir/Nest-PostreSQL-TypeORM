import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/db-entities/user.entity';
import { ImageType } from '../../common/enums';
import { BlogEntity } from '../../blogs/entities/db-entities/blog.entity';
import { PostEntity } from '../../posts/entities/db-entities/post.entity';

@Entity({ name: 'fileUploading' })
export class FileUploadingEntity {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  blogId: string;

  @Column({ type: 'uuid', nullable: true, default: null })
  postId: string;

  @Column({
    type: 'enum',
    enum: ImageType,
  })
  type: ImageType;

  @Column({ type: 'integer' })
  width: number;

  @Column({ type: 'integer' })
  height: number;

  @Column({ type: 'integer' })
  size: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.uploadedFiles)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => BlogEntity, (blogEntity) => blogEntity.uploadedFiles)
  @JoinColumn({ name: 'blogId' })
  blog: BlogEntity;

  @ManyToOne(() => PostEntity, (postEntity) => postEntity.uploadedFiles)
  @JoinColumn({ name: 'postId' })
  post: PostEntity;
}
