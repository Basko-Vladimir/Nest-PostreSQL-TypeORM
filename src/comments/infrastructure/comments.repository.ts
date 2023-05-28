import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CommentEntity } from '../entities/db-entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private typeOrmCommentRepository: Repository<CommentEntity>,
  ) {}

  async findCommentById(commentId: string): Promise<CommentEntity> {
    return this.typeOrmCommentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'user')
      .where('comment.id = :commentId', { commentId })
      .getOne();
  }

  async createComment(authorId, postId, content): Promise<string> {
    const createdCommentData = await this.typeOrmCommentRepository
      .createQueryBuilder()
      .insert()
      .into(CommentEntity)
      .values({ authorId, postId, content })
      .returning('id')
      .execute();

    return createdCommentData.identifiers[0].id;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.typeOrmCommentRepository
      .createQueryBuilder()
      .delete()
      .from(CommentEntity)
      .where('id = :commentId', { commentId })
      .execute();
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    await this.typeOrmCommentRepository
      .createQueryBuilder()
      .update(CommentEntity)
      .set({ content })
      .where('id = :commentId', { commentId })
      .execute();
  }
}
