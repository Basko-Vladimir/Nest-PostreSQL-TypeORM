import { Injectable } from '@nestjs/common';
import { IComment } from '../entities/interfaces';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(private dataSource: DataSource) {}

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

  async createComment(userId, postId, content): Promise<IComment | null> {
    const data = await this.dataSource.query(
      ` INSERT INTO "comment"
          ("authorId", "postId", "content")
          VALUES($1, $2, $3)
          RETURNING "id"
      `,
      [userId, postId, content],
    );
    const commentWithAuthorInfo = await this.dataSource.query(
      ` SELECT
          "comment".*,
          "user"."login" as "userLogin"
        FROM "comment"
          LEFT JOIN "user" ON "user"."id" = "comment"."authorId"
          WHERE "comment"."id" = $1
      `,
      [data[0].id],
    );

    return commentWithAuthorInfo[0] || null;
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
