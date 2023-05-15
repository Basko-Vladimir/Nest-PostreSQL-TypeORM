import { Injectable } from '@nestjs/common';
import { BlogsQueryParamsDto } from '../api/dto/blogs-query-params.dto';
import { BlogSortByField, SortDirection } from '../../common/enums';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
} from '../../common/utils';
import {
  AllBlogsOutputModel,
  IBlogOutputModel,
} from '../api/dto/blogs-output-models.dto';
import { mapDbBlogToBlogOutputModel } from '../mappers/blogs-mappers';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IBlog } from '../entities/interfaces';

interface IBlogsDataByQueryParams {
  blogs: IBlog[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

@Injectable()
export class QueryBlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllBlogs(
    queryParams: BlogsQueryParamsDto,
  ): Promise<AllBlogsOutputModel> {
    const { blogs, totalCount, pageNumber, pageSize } =
      await this.getBlogsDataByQueryParams(queryParams, false);

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: blogs.map(mapDbBlogToBlogOutputModel),
    };
  }

  async findBlogById(blogId: string): Promise<IBlogOutputModel | null> {
    const data = await this.dataSource.query(
      ` SELECT *
        FROM "blog"
          WHERE "id" = $1 AND "isBanned" = false
      `,
      [blogId],
    );

    if (!data.length) return null;

    return mapDbBlogToBlogOutputModel(data[0]);
  }

  protected async getBlogsDataByQueryParams(
    queryParams: BlogsQueryParamsDto,
    isBanned?: boolean,
    userId?: string,
  ): Promise<IBlogsDataByQueryParams> {
    const {
      sortBy = BlogSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = 1,
      pageSize = 10,
      searchNameTerm = '',
    } = queryParams;
    const offset = countSkipValue(pageNumber, pageSize);
    const isBannedCondition =
      typeof isBanned === 'boolean'
        ? `AND "blog"."isBanned" = ${isBanned}`
        : '';
    const userIdCondition = userId ? `AND "blog"."ownerId" = '${userId}'` : '';
    const countResult = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "blog"
          LEFT JOIN "user" ON "user"."id" = "blog"."ownerId"
          WHERE "name" ILIKE $1 ${isBannedCondition} ${userIdCondition}
      `,
      [`%${searchNameTerm}%`],
    );
    const totalCount = countResult[0].count;
    const blogs = await this.dataSource.query(
      ` SELECT
          "blog".*,
          "user"."login" as "ownerLogin"
        FROM "blog"
          LEFT JOIN "user" ON "user"."id" = "blog"."ownerId"
          WHERE "name" ILIKE $1 ${isBannedCondition} ${userIdCondition}
          ORDER BY
            CASE
              WHEN $2 = 'asc' THEN
                CASE
                  WHEN $3 = '${BlogSortByField.websiteUrl}' THEN "websiteUrl"
                  WHEN $3 = '${BlogSortByField.name}' THEN "name"
                  ELSE "blog"."createdAt"::varchar
                END
              END ASC,
            CASE
              WHEN $2 = 'desc' THEN
                CASE
                  WHEN $3 = '${BlogSortByField.websiteUrl}' THEN "websiteUrl"
                  WHEN $3 = '${BlogSortByField.name}' THEN "name"
                  ELSE "blog"."createdAt"::varchar
                END
              END DESC
          OFFSET $4 LIMIT $5
      `,
      [`%${searchNameTerm}%`, sortDirection, sortBy, offset, pageSize],
    );

    return { blogs, totalCount, pageNumber, pageSize };
  }
}
