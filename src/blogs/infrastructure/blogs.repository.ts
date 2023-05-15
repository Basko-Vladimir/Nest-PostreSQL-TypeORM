import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IBlog } from '../entities/interfaces';
import { CreateBlogDto } from '../api/dto/create-blog.dto';
import { UpdateBlogDto } from '../api/dto/update-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogById(blogId): Promise<IBlog | null> {
    const data = await this.dataSource.query(
      `SELECT *
        FROM "blog"
        WHERE id = $1
      `,
      [blogId],
    );

    return data[0] || null;
  }

  async createBlog(
    ownerId: string,
    createBlogDto: CreateBlogDto,
  ): Promise<IBlog> {
    const { name, websiteUrl, description } = createBlogDto;
    const data = await this.dataSource.query(
      `INSERT INTO "blog"
        ("name", "websiteUrl", "description", "ownerId")
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [name, websiteUrl, description, ownerId],
    );
    return data[0];
  }

  async updateBlog(
    blogId: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<void> {
    const { name, websiteUrl, description } = updateBlogDto;
    await this.dataSource.query(
      `UPDATE "blog"
        SET "name" = $1, "websiteUrl" = $2, "description" = $3
        WHERE "id" = $4
       `,
      [name, websiteUrl, description, blogId],
    );
  }

  async updateBlogBanStatus(
    blogId: string,
    isBanned: boolean,
    banDate: string,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "blog"
        SET "isBanned" = ${isBanned}, "banDate" = $1
        WHERE "id" = $2
      `,
      [banDate, blogId],
    );
  }

  async bindBlogWithUser(blogId: string, userId: string): Promise<void> {
    await this.dataSource.query(
      ` UPDATE "blog"
          SET "ownerId" = $1
          WHERE "id" = $2
      `,
      [userId, blogId],
    );
  }

  async deleteBlog(blogId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM "blog" WHERE id = $1`, [blogId]);
  }

  async deleteAllBlogs(): Promise<void> {
    return this.dataSource.query(`DELETE FROM "blog"`);
  }
}
