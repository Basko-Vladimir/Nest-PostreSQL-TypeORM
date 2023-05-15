import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ICommentWithLikeInfoOutputModel } from './dto/comments-output-models.dto';
import { BearerAuthGuard } from '../../common/guards/bearer-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AddUserToRequestGuard } from '../../common/guards/add-user-to-request.guard';
import { QueryCommentsRepository } from '../infrastructure/query-comments.repository';
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/update-comment-like-status.useCase';
import { GetFullCommentQuery } from '../application/use-cases/get-full-comment.useCase';
import { ParamIdType } from '../../common/decorators/param-id-type.decorator';
import { IdTypes } from '../../common/enums';
import { CheckExistingEntityGuard } from '../../common/guards/check-existing-entity.guard';
import { ActionsOnCommentGuard } from '../../common/guards/actions-on-comment.guard';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.useCase';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.useCase';
import { LikeStatusDto } from '../../likes/api/dto/like-status.dto';
import { Comment } from '../../common/decorators/comment.decorator';
import { IComment } from '../entities/interfaces';

@Controller('comments')
export class CommentsController {
  constructor(
    private queryCommentsRepository: QueryCommentsRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ParamIdType([IdTypes.COMMENT_ID])
  @UseGuards(CheckExistingEntityGuard, AddUserToRequestGuard)
  async findCommentById(
    @Param('id') commentId: string,
    @User('id') userId: string,
  ): Promise<ICommentWithLikeInfoOutputModel> {
    const commentOutputModel =
      await this.queryCommentsRepository.findCommentById(commentId);

    return this.queryBus.execute(
      new GetFullCommentQuery(commentOutputModel, userId || null),
    );
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.COMMENT_ID])
  @UseGuards(CheckExistingEntityGuard, BearerAuthGuard, ActionsOnCommentGuard)
  async deleteComment(@Param('commentId') commentId: string): Promise<void> {
    return await this.commandBus.execute(new DeleteCommentCommand(commentId));
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.COMMENT_ID])
  @UseGuards(CheckExistingEntityGuard, BearerAuthGuard, ActionsOnCommentGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, updateCommentDto),
    );
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.COMMENT_ID])
  @UseGuards(CheckExistingEntityGuard, BearerAuthGuard)
  async updateCommentLikeStatus(
    @Comment() comment: IComment,
    @User('id') userId: string,
    @Body() likeStatusDto: LikeStatusDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(
        userId,
        comment,
        likeStatusDto.likeStatus,
      ),
    );
  }
}
