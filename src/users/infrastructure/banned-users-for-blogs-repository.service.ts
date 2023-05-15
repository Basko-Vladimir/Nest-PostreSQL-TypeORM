import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IBlockedUserForBlog } from '../entities/interfaces';

@Injectable()
export class BannedUsersForBlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBannedUserForBlog(
    blogId: string,
    userId: string,
  ): Promise<IBlockedUserForBlog | null> {
    const data = await this.dataSource.query(
      ` SELECT *
        FROM "blockedUserForBlog"
          WHERE "blogId" = $1 AND "userId" = $2
      `,
      [blogId, userId],
    );

    return data[0] || null;
  }

  async createBannedUserForBlog(
    blogId: string,
    userId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<void> {
    await this.dataSource.query(
      ` INSERT INTO "blockedUserForBlog"
        ("blogId", "userId", "isBanned", "banReason", "banDate")
        VALUES($1, $2, ${isBanned}, $3, NOW())
      `,
      [blogId, userId, banReason],
    );
  }

  async updateUserBanStatusForSpecificBlog(
    blogId: string,
    userId: string,
    isBanned: boolean,
    banReason: string,
    banDate: string,
  ): Promise<void> {
    await this.dataSource.query(
      ` UPDATE "blockedUserForBlog"
          SET "isBanned" = ${isBanned}, "banReason" = $1, "banDate" = $2
          WHERE "blogId" = $3 AND "userId" = $4
      `,
      [banReason, banDate, blogId, userId],
    );
  }

  async deleteAllBannedUsersForBlogs(): Promise<void> {
    return this.dataSource.query(`DELETE FROM "blockedUserForBlog"`);
  }

  async checkUserForBanForBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const data = await this.dataSource.query(
      ` SELECT *
        FROM "blockedUserForBlog"
          WHERE "blogId" = $1 AND "userId" = $2
      `,
      [blogId, userId],
    );

    return Boolean(data[0]?.isBanned);
  }
}
