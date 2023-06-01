import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PostsQueryParamsDto } from './dto/posts-query-params.dto';
import { BearerAuthGuard } from '../../common/guards/bearer-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { AddUserToRequestGuard } from '../../common/guards/add-user-to-request.guard';
import { QueryPostsRepository } from '../infrastructure/query-posts.repository';
import { GetFullPostQuery } from '../application/use-cases/get-full-post.useCase';
import { ParamIdType } from '../../common/decorators/param-id-type.decorator';
import { IdTypes, LikeStatus } from '../../common/enums';
import { CheckExistingEntityGuard } from '../../common/guards/check-existing-entity.guard';
import { CreateCommentForPostDto } from './dto/create-comment-for-post.dto';
import {
  AllCommentsOutputModel,
  ICommentWithLikeInfoOutputModel,
} from '../../comments/api/dto/comments-output-models.dto';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment.useCase';
import { QueryCommentsRepository } from '../../comments/infrastructure/query-comments.repository';
import { CheckUserForBanByPostGuard } from '../../common/guards/check-user-for-ban-by-post.guard';
import { UpdateLikeStatusDto } from '../../likes/api/dto/update-like-status.dto';
import { UpdatePostLikeStatusCommand } from '../application/use-cases/update-post-like-status.useCase';
import { CommentsQueryParamsDto } from '../../comments/api/dto/comments-query-params.dto';
import { GetAllFullCommentsQuery } from '../../comments/application/use-cases/get-all-full-comments.useCase';
import { IFullPostOutputModel } from './dto/posts-output-models.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private queryPostsRepository: QueryPostsRepository,
    private queryCommentsRepository: QueryCommentsRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(AddUserToRequestGuard)
  async findAllPosts(
    @Query() queryParams: PostsQueryParamsDto,
    @User('id') userId: string,
  ): Promise<any> {
    console.log({ queryParams });
    return this.queryPostsRepository.findAllPosts(
      queryParams,
      null,
      userId || null,
    );
  }

  @Get(':postId/comments')
  @ParamIdType([IdTypes.POST_ID])
  @UseGuards(CheckExistingEntityGuard, AddUserToRequestGuard)
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() queryParams: CommentsQueryParamsDto,
    @User('id') userId: string,
  ): Promise<AllCommentsOutputModel> {
    const allCommentsOutputModel =
      await this.queryCommentsRepository.findAllComments(queryParams, postId);

    return this.queryBus.execute(
      new GetAllFullCommentsQuery(allCommentsOutputModel, userId || null),
    );
  }

  @Get(':id')
  @ParamIdType([IdTypes.POST_ID])
  @UseGuards(CheckExistingEntityGuard, AddUserToRequestGuard)
  async findPostById(
    @Param('id') postId: string,
    @User('id') userId: string,
  ): Promise<IFullPostOutputModel> {
    const postOutputModel = await this.queryPostsRepository.findPostById(
      postId,
    );

    return this.queryBus.execute(new GetFullPostQuery(postOutputModel, userId));
  }

  @Post(':postId/comments')
  @ParamIdType([IdTypes.POST_ID])
  @UseGuards(
    CheckExistingEntityGuard,
    BearerAuthGuard,
    CheckUserForBanByPostGuard,
  )
  async createCommentForPost(
    @Param('postId') postId: string,
    @User('id') userId: string,
    @Body() createCommentForPostDto: CreateCommentForPostDto,
  ): Promise<ICommentWithLikeInfoOutputModel> {
    const createdCommentId = await this.commandBus.execute(
      new CreateCommentCommand(postId, userId, createCommentForPostDto.content),
    );
    const commentOutputModel =
      await this.queryCommentsRepository.findCommentById(createdCommentId);

    return {
      ...commentOutputModel,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE,
      },
    };
  }

  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.POST_ID])
  @UseGuards(CheckExistingEntityGuard, BearerAuthGuard)
  async updatePostLikeStatus(
    @Param('postId') postId: string,
    @User('id') userId: string,
    @Body() likeStatusDto: UpdateLikeStatusDto,
  ): Promise<void> {
    const { likeStatus } = likeStatusDto;
    await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(userId, postId, likeStatus),
    );
  }
}
