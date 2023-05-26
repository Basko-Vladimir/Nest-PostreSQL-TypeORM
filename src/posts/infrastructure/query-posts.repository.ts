import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostsQueryParamsDto } from '../api/dto/posts-query-params.dto';
import {
  AllPostsOutputModel,
  IPostOutputModel,
} from '../api/dto/posts-output-models.dto';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../common/utils';
import { PostSortByField, SortDirection } from '../../common/enums';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';
import { mapDbPostToPostOutputModel } from '../mappers/posts-mapper';
import { PostEntity } from '../entities/db-entities/post.entity';

@Injectable()
export class QueryPostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(PostEntity)
    private typeOrmPostRepository: Repository<PostEntity>,
  ) {}

  async findAllPosts(
    queryParams: PostsQueryParamsDto,
    blogId?: string,
  ): Promise<AllPostsOutputModel> {
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      pageNumber = DEFAULT_PAGE_NUMBER,
      sortBy = PostSortByField.createdAt,
      sortDirection = SortDirection.desc,
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);

    const selectQueryBuilder = this.typeOrmPostRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.blog', 'blog');
    const dbSortDirection = getDbSortDirection(sortDirection);

    if (blogId) {
      selectQueryBuilder.where('post.blogId = :blogId', { blogId });
    }

    const totalCount = await selectQueryBuilder.getCount();
    const posts = await selectQueryBuilder
      .orderBy(`blog.${sortBy}`, dbSortDirection)
      .skip(skip)
      .take(pageSize)
      .getMany();

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: posts.map(mapDbPostToPostOutputModel),
    };
  }

  async findPostById(postId: string): Promise<IPostOutputModel> {
    const targetPost = await this.typeOrmPostRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.blog', 'blog')
      .where('post.id = :postId', { postId })
      .andWhere('blog.isBanned = :isBanned', { isBanned: false })
      .getOne();

    return mapDbPostToPostOutputModel(targetPost);
  }
}
