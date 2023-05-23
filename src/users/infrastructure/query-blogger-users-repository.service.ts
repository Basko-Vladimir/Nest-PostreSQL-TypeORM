import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AllBannedUsersForSpecificBlogOutputModel } from '../api/dto/banned-users-for-specific-blog-output-model.dto';
import { BannedUsersForSpecificBlogQueryParamsDto } from '../api/dto/banned-users-for-specific-blog-query-params.dto';
import { mapDbUserToBannedUserForSpecificBlogOutputModel } from '../mappers/users-mappers';
import { SortDirection, UserSortByField } from '../../common/enums';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
} from '../../common/utils';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';

@Injectable()
export class QueryBloggerUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllBannedUsersForSpecificBlog(
    blogId: string,
    queryParams: BannedUsersForSpecificBlogQueryParamsDto,
  ): Promise<AllBannedUsersForSpecificBlogOutputModel> {
    const {
      sortBy = UserSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
      searchLoginTerm = '',
    } = queryParams;
    const offset = countSkipValue(pageNumber, pageSize);
    const countData = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "user"
        LEFT JOIN "blockedUserForBlog" ON "blockedUserForBlog"."userId" = "user"."id"
          WHERE "user"."login" LIKE LOWER($1)
            AND "blockedUserForBlog"."isBanned" = true
            AND "blockedUserForBlog"."blogId" = $2
      `,
      [`%${searchLoginTerm}%`, blogId],
    );
    const totalCount = countData[0].count;
    const users = await this.dataSource.query(
      ` SELECT
          "user".*,
          "blockedUserForBlog"."isBanned" as "isBannedForSpecificBlog",
          "blockedUserForBlog"."banDate" as "banDateForSpecificBlog",
          "blockedUserForBlog"."banReason" as "banReasonForSpecificBlog"
        FROM "user"
        LEFT JOIN "blockedUserForBlog" ON "blockedUserForBlog"."userId" = "user"."id"
          WHERE "user"."login" LIKE LOWER($1)
            AND "blockedUserForBlog"."isBanned" = true
            AND "blockedUserForBlog"."blogId" = $2
          ORDER BY
             CASE
              WHEN $3 = 'asc' THEN
                CASE
                  WHEN $4 = '${UserSortByField.email}' THEN "email"
                  WHEN $4 = '${UserSortByField.login}' THEN "login"
                  ELSE "createdAt"::varchar
                END
              END ASC,
            CASE
              WHEN $3 = 'desc' THEN
                 CASE
                  WHEN $4 = '${UserSortByField.email}' THEN "email"
                  WHEN $4 = '${UserSortByField.login}' THEN "login"
                  ELSE "createdAt"::varchar
                END
              END DESC
          OFFSET $5 LIMIT $6
      `,
      [`%${searchLoginTerm}%`, blogId, sortDirection, sortBy, offset, pageSize],
    );

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: users.map(mapDbUserToBannedUserForSpecificBlogOutputModel),
    };
  }
}
