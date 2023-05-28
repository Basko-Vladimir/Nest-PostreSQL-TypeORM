import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePostForBlogDto } from '../../blogs/api/dto/create-post-for-blog.dto';
import { UpdatePostDto } from '../api/dto/update-post.dto';
import { PostEntity } from '../entities/db-entities/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(PostEntity)
    private typeOrmPostRepository: Repository<PostEntity>,
  ) {}

  async findPostById(postId: string): Promise<PostEntity> {
    return this.typeOrmPostRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.blog', 'blogName')
      .where('post.id = :postId', { postId })
      .getOne();
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
