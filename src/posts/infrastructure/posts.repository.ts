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
      .innerJoinAndSelect('post.blog', 'blog')
      .where('post.id = :postId', { postId })
      .andWhere('blog.isBanned = :isBanned', { isBanned: false })
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

    await this.typeOrmPostRepository
      .createQueryBuilder('post')
      .update()
      .set({ title, content, shortDescription, blogId })
      .where('post.id = :postId', { postId })
      .execute();
  }

  async deletePost(postId: string): Promise<void> {
    await this.typeOrmPostRepository
      .createQueryBuilder('post')
      .delete()
      .from(PostEntity)
      .where('post.id = :postId', { postId })
      .execute();
  }
}
