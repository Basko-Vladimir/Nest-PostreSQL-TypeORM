import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePostForBlogDto } from '../../blogs/api/dto/create-post-for-blog.dto';
import { IPost } from '../entities/interfaces';
import { UpdatePostDto } from '../api/dto/update-post.dto';
import { PostEntity } from '../entities/db-entities/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(PostEntity)
    private typeOrmPostRepository: Repository<PostEntity>,
  ) {}

  async findPostById(postId: string): Promise<IPost | null> {
    const data = await this.dataSource.query(
      ` SELECT
          "post".*,
          "blog"."name" as "blogName"
        FROM "post"
          LEFT JOIN "blog" ON "blog"."id" = "post"."blogId"
          WHERE "post"."id" = $1
      `,
      [postId],
    );

    return data[0] || null;
  }

  async createPost(
    createPostForBlogDto: CreatePostForBlogDto,
    blogId: string,
    userId: string,
  ): Promise<string> {
    const { title, shortDescription, content } = createPostForBlogDto;

    const createdPostData = await this.typeOrmPostRepository
      .createQueryBuilder()
      .insert()
      .into(PostEntity)
      .values({ title, shortDescription, content, blogId, userId })
      .returning('id')
      .execute();

    return createdPostData.identifiers[0].id;
  }

  async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<void> {
    const { title, content, shortDescription, blogId } = updatePostDto;
    await this.dataSource.query(
      `UPDATE "post"
        SET "title" = $1, "content" = $2, "shortDescription" = $3, "blogId" = $4
        WHERE "id" = $5
       `,
      [title, content, shortDescription, blogId, postId],
    );
  }

  async deletePost(postId: string): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM "post"
        WHERE "id" = $1
      `,
      [postId],
    );
  }

  async deleteAllPosts(): Promise<void> {
    return this.dataSource.query(`DELETE FROM "post"`);
  }
}
