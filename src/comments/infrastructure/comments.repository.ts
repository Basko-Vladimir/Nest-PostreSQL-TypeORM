import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IComment } from '../entities/interfaces';
import { CommentEntity } from '../entities/db-entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(CommentEntity)
    private typeOrmCommentRepository: Repository<CommentEntity>,
  ) {}

  async findCommentById(commentId: string): Promise<IComment | null> {
    const data = await this.dataSource.query(
      ` SELECT "comment".*
        FROM "comment"
          INNER JOIN "user" ON "comment"."authorId" = "user"."id"
          WHERE "comment"."id" = $1 AND "user"."isBanned" = false
      `,
      [commentId],
    );

    return data[0] || null;
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
    await this.dataSource.query(
      `DELETE FROM "comment"
         WHERE "id" = $1
      `,
      [commentId],
    );
  }

  async updateComment(commentId: string, content: string): Promise<void> {
    await this.dataSource.query(
      ` UPDATE "comment"
        SET "content" = $1
          WHERE "id" = $2
      `,
      [content, commentId],
    );
  }

  async deleteAllComments(): Promise<void> {
    return this.dataSource.query(`DELETE FROM "comment"`);
  }
}
