import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IBannedUserForBlog } from '../entities/interfaces';
import { BannedUserForBlogEntity } from '../entities/db-entities/banned-user-for-blog.entity';

@Injectable()
export class BannedUsersForBlogsRepository {
  constructor(
    @InjectRepository(BannedUserForBlogEntity)
    private typeOrmBannedUserForBlogRepository: Repository<BannedUserForBlogEntity>,
  ) {}

  async findBannedUserForBlog(
    blogId: string,
    userId: string,
  ): Promise<IBannedUserForBlog | null> {
    return this.typeOrmBannedUserForBlogRepository
      .createQueryBuilder('bannedUserForBlog')
      .select('bannedUserForBlog')
      .where('bannedUserForBlog.blogId = :blogId', { blogId })
      .andWhere('bannedUserForBlog.userId = :userId', { userId })
      .getOne();
  }

  async createBannedUserForBlog(
    blogId: string,
    userId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<void> {
    await this.typeOrmBannedUserForBlogRepository
      .createQueryBuilder()
      .insert()
      .into(BannedUserForBlogEntity)
      .values({ blogId, userId, isBanned, banReason, banDate: new Date() })
      .execute();
  }

  async updateUserBanStatusForSpecificBlog(
    blogId: string,
    userId: string,
    isBanned: boolean,
    banReason: string,
    banDate: string,
  ): Promise<void> {
    await this.typeOrmBannedUserForBlogRepository
      .createQueryBuilder()
      .update(BannedUserForBlogEntity)
      .set({ isBanned, banDate, banReason })
      .where('blogId = :blogId', { blogId })
      .andWhere('userId = :userId', { userId })
      .execute();
  }

  async checkUserOnBanForBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const user = await this.findBannedUserForBlog(blogId, userId);

    return Boolean(user?.isBanned);
  }
}
