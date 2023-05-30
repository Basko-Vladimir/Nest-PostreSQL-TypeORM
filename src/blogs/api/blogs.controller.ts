import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BlogsQueryParamsDto } from './dto/blogs-query-params.dto';
import {
  AllBlogsOutputModel,
  BlogAllFullPostsOutputModel,
  IBlogOutputModel,
} from './dto/blogs-output-models.dto';
import { PostsQueryParamsDto } from '../../posts/api/dto/posts-query-params.dto';
import { AddUserToRequestGuard } from '../../common/guards/add-user-to-request.guard';
import { User } from '../../common/decorators/user.decorator';
import { QueryBlogsRepository } from '../infrastructure/query-blogs.repository';
import { QueryPostsRepository } from '../../posts/infrastructure/query-posts.repository';
import { GetAllFullPostsQuery } from '../../posts/application/use-cases/get-all-full-posts.useCase';
import { ParamIdType } from '../../common/decorators/param-id-type.decorator';
import { IdTypes } from '../../common/enums';
import { CheckExistingEntityGuard } from '../../common/guards/check-existing-entity.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private queryBlogsRepository: QueryBlogsRepository,
    private queryPostsRepository: QueryPostsRepository,
  ) {}

  @Get()
  async findAllBlogs(
    @Query() query: BlogsQueryParamsDto,
  ): Promise<AllBlogsOutputModel> {
    return this.queryBlogsRepository.findAllBlogs(query);
  }

  @Get(':id')
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard)
  async findBlogById(@Param('id') blogId: string): Promise<IBlogOutputModel> {
    const targetBlog = await this.queryBlogsRepository.findBlogById(blogId);

    if (!targetBlog) throw new NotFoundException();

    return targetBlog;
  }

  @Get(':blogId/posts')
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard, AddUserToRequestGuard)
  async findAllPostsByBlogId(
    @Query() queryParams: PostsQueryParamsDto,
    @Param('blogId') blogId: string,
    @User('id') userId: string,
  ): Promise<BlogAllFullPostsOutputModel> {
    const allPostsOutputModel = await this.queryPostsRepository.findAllPosts(
      queryParams,
      blogId,
    );

    return this.queryBus.execute(
      new GetAllFullPostsQuery(allPostsOutputModel, userId),
    );
  }
}
