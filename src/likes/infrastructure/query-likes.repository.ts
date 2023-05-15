import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../common/enums';
import { mapDbLikeToLikeInfoOutputModel } from '../mappers/likes-mapper';
import {
  ExtendedLikesInfoOutputModel,
  LikesInfoOutputModel,
} from '../api/dto/likes-output-models.dto';

@Injectable()
export class QueryLikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getLikesInfo(
    userId: string,
    commentId: string,
  ): Promise<LikesInfoOutputModel> {
    const likesCountData = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "like"
          INNER JOIN "user" ON "like"."userId" = "user"."id"
          WHERE "commentId" = $1
            AND "status" = '${LikeStatus.LIKE}'
            AND "user"."isBanned" = false
      `,
      [commentId],
    );
    const dislikesCountData = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "like"
          INNER JOIN "user" ON "like"."userId" = "user"."id"
          WHERE "commentId" = $1
            AND "status" = '${LikeStatus.DISLIKE}'
            AND "user"."isBanned" = false
      `,
      [commentId],
    );
    const likesCount = Number(likesCountData[0].count);
    const dislikesCount = Number(dislikesCountData[0].count);
    let myStatus = LikeStatus.NONE;

    if (userId) {
      const currentUserLike = await this.dataSource.query(
        ` SELECT *
          FROM "like"
            INNER JOIN "user" ON "like"."userId" = "user"."id"
            WHERE "userId" = $1
            AND "commentId" = $2
            AND "user"."isBanned" = false
        `,
        [userId, commentId],
      );
      myStatus = currentUserLike[0] ? currentUserLike[0].status : myStatus;
    }

    return {
      likesCount,
      dislikesCount,
      myStatus,
    };
  }

  async getExtendedLikesInfo(
    userId: string | null,
    postId: string,
  ): Promise<ExtendedLikesInfoOutputModel> {
    const likesCountData = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "like"
          INNER JOIN "user" ON "like"."userId" = "user"."id"
          WHERE "postId" = $1
            AND "commentId" IS NULL
            AND "status" = '${LikeStatus.LIKE}'
            AND "user"."isBanned" = false
      `,
      [postId],
    );
    const dislikesCountData = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "like"
          INNER JOIN "user" ON "like"."userId" = "user"."id"
          WHERE "postId" = $1
            AND "commentId" IS NULL
            AND "status" = '${LikeStatus.DISLIKE}'
            AND "user"."isBanned" = false
      `,
      [postId],
    );
    const likesCount = Number(likesCountData[0].count);
    const dislikesCount = Number(dislikesCountData[0].count);
    const newestLikes = await this.dataSource.query(
      ` SELECT "like".*, "user"."login" as "userLogin"
        FROM "like"
          INNER JOIN "user" ON "like"."userId" = "user"."id"
          WHERE "like"."postId" = $1
            AND "like"."commentId" IS NULL
            AND "like"."status" = '${LikeStatus.LIKE}'
            AND "user"."isBanned" = false
          ORDER BY "like"."createdAt" DESC
          LIMIT 3
      `,
      [postId],
    );

    let myStatus = LikeStatus.NONE;

    if (userId) {
      const currentUserLike = await this.dataSource.query(
        ` SELECT *
          FROM "like"
            INNER JOIN "user" ON "like"."userId" = "user"."id"
            WHERE "userId" = $1
              AND "postId" = $2
              AND "commentId" IS NULL
              AND "user"."isBanned" = false
        `,
        [userId, postId],
      );
      myStatus = currentUserLike[0] ? currentUserLike[0].status : myStatus;
    }

    return {
      likesCount,
      dislikesCount,
      myStatus,
      newestLikes: newestLikes.map(mapDbLikeToLikeInfoOutputModel),
    };
  }
}
