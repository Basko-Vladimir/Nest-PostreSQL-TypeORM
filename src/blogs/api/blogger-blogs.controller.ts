import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AllBlogsOutputModel,
  IBlogOutputModel,
} from './dto/blogs-output-models.dto';
import { BearerAuthGuard } from '../../common/guards/bearer-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { User } from '../../common/decorators/user.decorator';
import { QueryBlogsRepository } from '../infrastructure/query-blogs.repository';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateBlogCommand } from '../application/use-cases/create-blog.useCase';
import { CreatePostForBlogDto } from './dto/create-post-for-blog.dto';
import { IFullPostOutputModel } from '../../posts/api/dto/posts-output-models.dto';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.useCase';
import { QueryPostsRepository } from '../../posts/infrastructure/query-posts.repository';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog.useCase';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { UpdateBlogCommand } from '../application/use-cases/update-blog.useCase';
import { ActionsOnBlogGuard } from '../../common/guards/actions-on-blog.guard';
import { DeletePostCommand } from '../../posts/application/use-cases/delete-post.useCase';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post.useCase';
import { UpdatePostForBlogDto } from './dto/update-post-for-blog.dto';
import { QueryBloggerBlogsRepository } from '../infrastructure/query-blogger-blogs.repository';
import { CheckExistingEntityGuard } from '../../common/guards/check-existing-entity.guard';
import { ParamIdType } from '../../common/decorators/param-id-type.decorator';
import { IdTypes } from '../../common/enums';
import { BlogsQueryParamsDto } from './dto/blogs-query-params.dto';
import { CommentsQueryParamsDto } from '../../comments/api/dto/comments-query-params.dto';
import { AllBloggerCommentsOutputModel } from '../../comments/api/dto/comments-output-models.dto';
import { GetAllBloggerCommentsQuery } from '../../comments/application/use-cases/get-all-blogger-comments.useCase';
import { UserEntity } from '../../users/entities/db-entities/user.entity';

@Controller('blogger/blogs')
@UseGuards(BearerAuthGuard)
export class BloggerBlogsController {
  constructor(
    private queryBlogsRepository: QueryBlogsRepository,
    private queryBloggerBlogsRepository: QueryBloggerBlogsRepository,
    private queryPostsRepository: QueryPostsRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async findAllBlogsAsBlogger(
    @Query() query: BlogsQueryParamsDto,
    @User('id') userId: string,
  ): Promise<AllBlogsOutputModel> {
    return this.queryBloggerBlogsRepository.findAllBlogsAsBlogger(
      query,
      userId,
    );
  }

  @Get('comments')
  async findAllBloggerComments(
    @Query() queryParams: CommentsQueryParamsDto,
    @User() user: UserEntity,
  ): Promise<AllBloggerCommentsOutputModel> {
    return this.queryBus.execute(
      new GetAllBloggerCommentsQuery(queryParams, user.id),
    );
  }

  @Post()
  async createBlog(
    @Body() creatingData: CreateBlogDto,
    @User() user: UserEntity,
  ): Promise<IBlogOutputModel> {
    const createdBlogId = await this.commandBus.execute(
      new CreateBlogCommand(creatingData, user),
    );

    return this.queryBlogsRepository.findBlogById(createdBlogId);
  }

  @Post(':blogId/posts')
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard, ActionsOnBlogGuard)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() createPostForBlogDto: CreatePostForBlogDto,
    @User('id') userId: string,
  ): Promise<IFullPostOutputModel> {
    const createdPostId = await this.commandBus.execute(
      new CreatePostCommand(createPostForBlogDto, blogId, userId),
    );

    return this.queryPostsRepository.findPostById(createdPostId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard, ActionsOnBlogGuard)
  async deleteBlog(
    @Param('id')
    blogId: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(blogId));
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.BLOG_ID, IdTypes.POST_ID])
  @UseGuards(CheckExistingEntityGuard, ActionsOnBlogGuard)
  async deletePostSpecifiedBlog(
    @Param('postId')
    postId: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(postId));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard, ActionsOnBlogGuard)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateBlogCommand(blogId, updateBlogDto),
    );
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.BLOG_ID, IdTypes.POST_ID])
  @UseGuards(CheckExistingEntityGuard, ActionsOnBlogGuard)
  async updatePostSpecifiedBlog(
    @Param('postId') postId: string,
    @Param('blogId') blogId: string,
    @Body() updatePostForBlogDto: UpdatePostForBlogDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePostCommand(postId, { ...updatePostForBlogDto, blogId }),
    );
  }
}
