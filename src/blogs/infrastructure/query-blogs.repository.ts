import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BlogsQueryParamsDto } from '../api/dto/blogs-query-params.dto';
import { BlogSortByField, SortDirection } from '../../common/enums';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../common/utils';
import {
  AllBlogsOutputModel,
  IBlogOutputModel,
} from '../api/dto/blogs-output-models.dto';
import { mapDbBlogToBlogOutputModel } from '../mappers/blogs-mappers';
import { IBlog } from '../entities/interfaces';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';
import { BlogEntity } from '../entities/db-entities/blog.entity';

interface IBlogsDataByQueryParams {
  blogs: IBlog[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

@Injectable()
export class QueryBlogsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(BlogEntity)
    private typeOrmBlogRepository: Repository<BlogEntity>,
  ) {}

  async findAllBlogs(
    queryParams: BlogsQueryParamsDto,
  ): Promise<AllBlogsOutputModel> {
    const { blogs, totalCount, pageNumber, pageSize } =
      await this.getBlogsDataByQueryParams(queryParams, false);

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: blogs.map(mapDbBlogToBlogOutputModel),
    };
  }

  async findBlogById(blogId: string): Promise<IBlogOutputModel | null> {
    const targetBlog = await this.typeOrmBlogRepository
      .createQueryBuilder('blog')
      .select()
      .where('blog.id = :blogId', { blogId })
      .andWhere('blog.isBanned = :isBanned', { isBanned: false })
      .getOne();

    return mapDbBlogToBlogOutputModel(targetBlog);
  }

  protected async getBlogsDataByQueryParams(
    queryParams: BlogsQueryParamsDto,
    isBanned?: boolean,
    userId?: string,
  ): Promise<IBlogsDataByQueryParams> {
    const {
      sortBy = BlogSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
      searchNameTerm = '',
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const dbSortDirection = getDbSortDirection(sortDirection);
    const selectQueryBuilder = this.typeOrmBlogRepository
      .createQueryBuilder('blog')
      .innerJoinAndSelect('blog.user', 'user')
      .select(['blog.*', 'user.login as "ownerLogin"']);

    if (typeof isBanned === 'boolean') {
      selectQueryBuilder.where('blog.isBanned = :isBanned', { isBanned });
    }
    if (searchNameTerm) {
      selectQueryBuilder.andWhere('blog.name ilike :searchNameTerm', {
        searchNameTerm: `%${searchNameTerm}%`,
      });
    }
    if (userId) {
      selectQueryBuilder.andWhere('blog.ownerId = :userId', { userId });
    }

    const totalCount = await selectQueryBuilder.getCount();
    const blogs = await selectQueryBuilder
      .orderBy(`blog."${sortBy}"`, dbSortDirection)
      .skip(skip)
      .take(pageSize)
      .getRawMany();

    return { blogs, totalCount, pageNumber, pageSize };
  }
}
