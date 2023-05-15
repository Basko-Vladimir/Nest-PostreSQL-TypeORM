import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UsersQueryParamsDto } from '../api/dto/users-query-params.dto';
import { BanStatus, SortDirection, UserSortByField } from '../../common/enums';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
} from '../../common/utils';
import { mapDbUserToUserOutputModel } from '../mappers/users-mappers';
import { AllUsersOutputModel } from '../api/dto/users-output-models.dto';

@Injectable()
export class QueryAdminUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllUsers(
    queryParams: UsersQueryParamsDto,
  ): Promise<AllUsersOutputModel> {
    const {
      searchLoginTerm = '',
      searchEmailTerm = '',
      pageNumber = 1,
      pageSize = 10,
      sortBy = UserSortByField.createdAt,
      sortDirection = SortDirection.desc,
      banStatus = BanStatus.ALL,
    } = queryParams;
    const offset = countSkipValue(pageNumber, pageSize);
    const getTermsConditions = (
      searchLoginTerm: string,
      searchEmailTerm: string,
    ): string => {
      const result = [];
      if (searchLoginTerm) result.push(`"login" ILIKE '%${searchLoginTerm}%'`);
      if (searchEmailTerm) result.push(`"email" ILIKE '%${searchEmailTerm}%'`);

      switch (result.length) {
        case 0: {
          return '';
        }
        case 1: {
          return `${result[0]} AND `;
        }
        default: {
          return `${result.join(' OR ')} AND `;
        }
      }
    };
    const termsConditions = getTermsConditions(
      searchLoginTerm,
      searchEmailTerm,
    );

    const countResult = await this.dataSource.query(
      ` SELECT COUNT(*)
        FROM "user"
          LEFT JOIN "emailConfirmation" ON "emailConfirmation"."userId" = "user"."id"
          WHERE ${termsConditions}
            CASE
              WHEN $1 = '${BanStatus.BANNED}' THEN "isBanned" = true
              WHEN $1 = '${BanStatus.NOT_BANNED}' THEN "isBanned" = false
              ELSE "isBanned" IN (true, false)
            END
      `,
      [banStatus],
    );
    const totalCount = countResult[0].count;
    const users = await this.dataSource.query(
      ` SELECT
          "user".*,
          "emailConfirmation"."confirmationCode",
          "emailConfirmation"."isConfirmed",
          "emailConfirmation"."expirationDate"
        FROM "user"
          LEFT JOIN "emailConfirmation" ON "emailConfirmation"."userId" = "user"."id"
          WHERE ${termsConditions}
            CASE
              WHEN $5 = '${BanStatus.BANNED}' THEN "isBanned" = true
              WHEN $5 = '${BanStatus.NOT_BANNED}' THEN "isBanned" = false
              ELSE "isBanned" IN (true, false)
            END
          ORDER BY
            CASE
              WHEN $1 = 'asc' THEN
                CASE
                  WHEN $2 = '${UserSortByField.email}' THEN "email"
                  WHEN $2 = '${UserSortByField.login}' THEN "login"
                  ELSE "createdAt"::varchar
                END
              END ASC,
            CASE
              WHEN $1 = 'desc' THEN
                CASE
                  WHEN $2 = '${UserSortByField.email}' THEN "email"
                  WHEN $2 = '${UserSortByField.login}' THEN "login"
                  ELSE "createdAt"::varchar
                END
              END DESC
          OFFSET $3 LIMIT $4
      `,
      [sortDirection, sortBy, offset, pageSize, banStatus],
    );

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: users.map(mapDbUserToUserOutputModel),
    };
  }

  async findUserById(userId: string): Promise<any> {
    return;
  }
}
