import { Injectable } from '@nestjs/common';
import {
  AllBloggerCommentsOutputModel,
  AllCommentsOutputModel,
  IBloggerCommentOutputModel,
  ICommentOutputModel,
} from '../api/dto/comments-output-models.dto';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
} from '../../common/utils';
import {
  mapDbCommentToBloggerCommentOutputModel,
  mapDbCommentToCommentOutputModel,
} from '../mappers/comments-mapper';
import { CommentSortByField, SortDirection } from '../../common/enums';
import { CommentsQueryParamsDto } from '../api/dto/comments-query-params.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryLikesRepository } from '../../likes/infrastructure/query-likes.repository';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';

@Injectable()
export class QueryCommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private queryLikesRepository: QueryLikesRepository,
  ) {}

  async findAllComments(
    queryParams: CommentsQueryParamsDto,
    postId?: string,
  ): Promise<AllCommentsOutputModel> {
    const { pageSize, pageNumber, comments, totalCount } =
      await this.getCommentsDataByFilters(queryParams, false, postId);

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: comments.map(mapDbCommentToCommentOutputModel),
    };
  }

  async findAllBloggerComments(
    queryParams: CommentsQueryParamsDto,
    userId: string,
  ): Promise<AllBloggerCommentsOutputModel> {
    const { sortBy, sortDirection, pageSize, pageNumber } = queryParams;
    const offset = countSkipValue(pageNumber, pageSize);

    const countResult = await this.dataSource.query(
      ` SELECT COUNT(DISTINCT "comment"."content")
        FROM "comment"
          INNER JOIN "user" ON "user"."id" = "comment"."authorId"
          INNER JOIN "post" ON "post"."userId" = "comment"."authorId"
          INNER JOIN "blog" ON "post"."userId" = "blog"."ownerId"
          WHERE "comment"."authorId" = $1 AND "user"."isBanned" = false
      `,
      [userId],
    );
    const totalCount = countResult[0].count;
    const comments = await this.dataSource.query(
      ` SELECT *
        FROM (
            SELECT DISTINCT ON ("comment"."content")
              "comment"."id",
              "comment"."createdAt",
              "comment"."updatedAt",
              "comment"."content",
              "comment"."authorId",
              "comment"."postId",
              "post"."title" as "postTitle",
              "blog"."id" as "blogId",
              "blog"."name" as "blogName",
              "user"."login" as "userLogin"
            FROM "comment"
            INNER JOIN "user" ON "user"."id" = "comment"."authorId"
              INNER JOIN "post" ON "post"."userId" = "comment"."authorId"
              INNER JOIN "blog" ON "post"."userId" = "blog"."ownerId"
              WHERE "comment"."authorId" = $1 AND "user"."isBanned" = false
              ORDER BY "comment"."content") t
        ORDER BY
          CASE
            WHEN $2 = 'asc' THEN
              CASE
                WHEN $3 = '${CommentSortByField.content}' THEN t."content"
                ELSE t."createdAt"::varchar
              END
            END ASC,
          CASE
            WHEN $2 = 'desc' THEN
              CASE
                WHEN $3 = '${CommentSortByField.content}' THEN t."content"
                ELSE t."createdAt"::varchar
              END
            END DESC
        OFFSET $4 LIMIT $5
      `,
      [userId, sortBy, sortDirection, offset, pageSize],
    );
    const bloggerComments: IBloggerCommentOutputModel[] = [];

    for (let i = 0; i < comments.length; i++) {
      const likesInfo = await this.queryLikesRepository.getLikesInfo(
        userId,
        comments[i].id,
      );

      bloggerComments.push(
        mapDbCommentToBloggerCommentOutputModel(comments[i], likesInfo),
      );
    }

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: bloggerComments,
    };
  }

  async findCommentById(
    commentId: string,
  ): Promise<ICommentOutputModel | null> {
    const data = await this.dataSource.query(
      ` SELECT
          "comment".*,
          "user"."login" as "userLogin"
        FROM "comment"
          LEFT JOIN "user" ON "user"."id" = "comment"."authorId"
          WHERE "comment"."id" = $1 AND "user"."isBanned" = false
      `,
      [commentId],
    );

    return data[0] ? mapDbCommentToCommentOutputModel(data[0]) : null;
  }

  async findNotBannedUserCommentById(commentId: string): Promise<any> {
    // const targetComment = await this.CommentModel.findById(commentId);
    //
    // if (!targetComment) throw new NotFoundException();
    //
    // const user: UserDocument = await this.UserModel.findById(
    //   String(targetComment.userId),
    // );
    //
    // if (!user || user.banInfo.isBanned) throw new NotFoundException();
    //
    // return mapDbCommentToCommentOutputModel(targetComment);
  }

  private async getCommentsDataByFilters(
    queryParams: CommentsQueryParamsDto,
    isBanned?: boolean,
    postId?: string,
  ): Promise<any> {
    const {
      sortBy = CommentSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
    } = queryParams;
    const offset = countSkipValue(pageNumber, pageSize);
    const postIdCondition = postId
      ? `WHERE "comment"."postId" = '${postId}'`
      : '';
    const isBannedCondition =
      typeof isBanned === 'boolean'
        ? `AND "user"."isBanned" = ${isBanned}`
        : '';
    const countResult = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "comment"
          LEFT JOIN "user" ON "user"."id" = "comment"."authorId"
          ${postIdCondition}
          ${isBannedCondition}
      `,
    );
    const totalCount = countResult[0].count;
    const comments = await this.dataSource.query(
      ` SELECT
          "comment".*,
          "user"."login" as "userLogin"
        FROM "comment"
          LEFT JOIN "user" ON "user"."id" = "comment"."authorId"
          ${postIdCondition}
          ${isBannedCondition}
        ORDER BY
          CASE
            WHEN $1 = 'asc' THEN
              CASE
                WHEN $2 = '${CommentSortByField.content}' THEN "comment"."content"
                ELSE "comment"."createdAt"::varchar
              END
            END ASC,
          CASE
            WHEN $1 = 'desc' THEN
              CASE
                WHEN $2 = '${CommentSortByField.content}' THEN "comment"."content"
                ELSE "comment"."createdAt"::varchar
              END
            END DESC
          OFFSET $3 LIMIT $4
      
      `,
      [sortDirection, sortBy, offset, pageSize],
    );

    return {
      comments,
      totalCount,
      pageNumber,
      pageSize,
    };
  }
}
