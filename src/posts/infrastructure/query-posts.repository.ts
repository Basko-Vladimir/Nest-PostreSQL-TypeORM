import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostsQueryParamsDto } from '../api/dto/posts-query-params.dto';
import {
  AllPostsOutputModel,
  IPostOutputModel,
} from '../api/dto/posts-output-models.dto';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
} from '../../common/utils';
import { PostSortByField, SortDirection } from '../../common/enums';
import { mapDbPostToPostOutputModel } from '../mappers/posts-mapper';

@Injectable()
export class QueryPostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllPosts(
    queryParams: PostsQueryParamsDto,
    blogId?: string,
  ): Promise<AllPostsOutputModel> {
    const {
      pageSize = 10,
      pageNumber = 1,
      sortBy = PostSortByField.createdAt,
      sortDirection = SortDirection.desc,
    } = queryParams;
    const blogIdCondition = blogId ? `WHERE "post"."blogId" = '${blogId}'` : '';
    const offset = countSkipValue(pageNumber, pageSize);

    const countResult = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "post"
          ${blogIdCondition}
      `,
    );
    const totalCount = countResult[0].count;
    const posts = await this.dataSource.query(
      ` SELECT
          "post".*,
          "blog"."name" as "blogName"
        FROM "post"
          LEFT JOIN "blog" ON "blog"."id" = "post"."blogId"
          ${blogIdCondition}
          ORDER BY
            CASE
              WHEN $1 = 'asc' THEN
                CASE
                  WHEN $2 = '${PostSortByField.blogName}' THEN "blog"."name"
                  WHEN $2 = '${PostSortByField.content}' THEN "post"."content"
                  WHEN $2 = '${PostSortByField.title}' THEN "post"."title"
                  WHEN $2 = '${PostSortByField.shortDescription}' THEN "post"."shortDescription"
                  ELSE "post"."createdAt"::varchar
                END
              END ASC,
            CASE
              WHEN $1 = 'desc' THEN
                CASE
                  WHEN $2 = '${PostSortByField.blogName}' THEN "blog"."name"
                  WHEN $2 = '${PostSortByField.content}' THEN "post"."content"
                  WHEN $2 = '${PostSortByField.title}' THEN "post"."title"
                  WHEN $2 = '${PostSortByField.shortDescription}' THEN "post"."shortDescription"
                  ELSE "post"."createdAt"::varchar
                END
              END DESC
           OFFSET $3 LIMIT $4
      `,
      [sortDirection, sortBy, offset, pageSize],
    );

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: posts.map(mapDbPostToPostOutputModel),
    };
  }

  async findPostById(postId: string): Promise<IPostOutputModel | null> {
    const data = await this.dataSource.query(
      ` SELECT
          "post".*,
          "blog"."name" as "blogName",
          "blog"."isBanned"
        FROM "post"
          LEFT JOIN "blog" ON "blog"."id" = "post"."blogId"
          WHERE "post"."id" = $1 AND "blog"."isBanned" = false
      `,
      [postId],
    );

    if (!data.length) return null;

    return mapDbPostToPostOutputModel(data[0]);
  }
}
