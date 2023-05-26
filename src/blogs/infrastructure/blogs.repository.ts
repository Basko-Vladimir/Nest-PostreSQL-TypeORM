import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IBlog } from '../entities/interfaces';
import { CreateBlogDto } from '../api/dto/create-blog.dto';
import { UpdateBlogDto } from '../api/dto/update-blog.dto';
import { BlogEntity } from '../entities/db-entities/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(BlogEntity)
    private typeOrmBlogRepository: Repository<BlogEntity>,
  ) {}

  async findBlogById(blogId): Promise<IBlog | null> {
    return this.typeOrmBlogRepository
      .createQueryBuilder('blog')
      .select('blog')
      .where('blog.id = :blogId', { blogId })
      .getOne();
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
    await this.typeOrmBlogRepository
      .createQueryBuilder('blog')
      .update(BlogEntity)
      .set({ isBanned, banDate })
      .where('blog.id = :blogId', { blogId })
      .execute();
  }

  async bindBlogWithUser(blogId: string, ownerId: string): Promise<void> {
    await this.typeOrmBlogRepository
      .createQueryBuilder('blog')
      .update(BlogEntity)
      .set({ ownerId })
      .where('blog.id = :blogId', { blogId })
      .execute();
  }

  async deleteBlog(blogId: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM "blog" WHERE id = $1`, [blogId]);
  }

  //Unused method, since cascade deleting has been set in relations of BlogEntity
  async deleteAllBlogs(): Promise<void> {
    return this.dataSource.query(`DELETE FROM "blog"`);
  }
}
