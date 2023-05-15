import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ILike } from '../entities/interfaces';
import { LikeStatus } from '../../common/enums';

@Injectable()
export class LikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getLikeByFilter(
    userId: string,
    postId: string,
    commentId: string = null,
  ): Promise<ILike | null> {
    const paramsArray = [userId, postId];
    let commentIdCondition = '"commentId" IS NULL';

    if (commentId) {
      commentIdCondition = '"commentId" = $3';
      paramsArray.push(commentId);
    }

    const data = await this.dataSource.query(
      ` SELECT *
        FROM "like"
          WHERE "userId" = $1 AND "postId" = $2 AND ${commentIdCondition}
      `,
      paramsArray,
    );

    return data[0] || null;
  }

  async createLike(
    userId: string,
    postId: string,
    status: LikeStatus,
    commentId: string,
  ): Promise<void> {
    await this.dataSource.query(
      ` INSERT INTO "like"
          ("userId", "postId", "status", "commentId")
          VALUES($1, $2, $3, $4)
      `,
      [userId, postId, status, commentId],
    );
  }

  async updateLike(
    userId: string,
    postId: string,
    status: LikeStatus,
    commentId: string,
  ): Promise<void> {
    const paramsArray = [status, userId, postId];
    let commentIdCondition = '"commentId" IS NULL';

    if (commentId) {
      commentIdCondition = '"commentId" = $4';
      paramsArray.push(commentId);
    }

    await this.dataSource.query(
      ` UPDATE "like"
          SET "status" = $1
          WHERE "userId" = $2 AND "postId" = $3 AND ${commentIdCondition}
      `,
      paramsArray,
    );
  }

  async deleteAllLikes(): Promise<void> {
    return this.dataSource.query(`DELETE FROM "like"`);
  }
}
