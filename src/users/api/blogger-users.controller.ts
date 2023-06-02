import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BearerAuthGuard } from '../../common/guards/bearer-auth.guard';
import { UpdateUserBanStatusForBlogDto } from './dto/update-user-ban-status-for-blog.dto';
import { UpdateUserBanStatusForBlogCommand } from '../application/use-cases/update-user-ban-status-for-blog.useCase';
import { AllBannedUsersForSpecificBlogOutputModel } from './dto/banned-users-for-specific-blog-output-model.dto';
import { BannedUsersForSpecificBlogQueryParamsDto } from './dto/banned-users-for-specific-blog-query-params.dto';
import { QueryBloggerUsersRepository } from '../infrastructure/query-blogger-users-repository.service';
import { ActionsOnBlogGuard } from '../../common/guards/actions-on-blog.guard';
import { ParamIdType } from '../../common/decorators/param-id-type.decorator';
import { IdTypes } from '../../common/enums';
import { CheckExistingEntityGuard } from '../../common/guards/check-existing-entity.guard';
import { User } from '../../common/decorators/user.decorator';

@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBloggerUsersRepositoryService: QueryBloggerUsersRepository,
  ) {}

  @Get('blog/:id')
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard, BearerAuthGuard, ActionsOnBlogGuard)
  async findBannedUsersForSpecificBlog(
    @Param('id') blogId: string,
    @Query() queryParams: BannedUsersForSpecificBlogQueryParamsDto,
  ): Promise<AllBannedUsersForSpecificBlogOutputModel> {
    return this.queryBloggerUsersRepositoryService.findAllBannedUsersForSpecificBlog(
      blogId,
      queryParams,
    );
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.USER_ID])
  @UseGuards(CheckExistingEntityGuard, BearerAuthGuard)
  async updateUserBanStatusForBlog(
    @Param('id') bannedUserId: string,
    @Body() updateUserBanStatusForBlogDto: UpdateUserBanStatusForBlogDto,
    @User('id') currentUserId: string,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateUserBanStatusForBlogCommand(
        bannedUserId,
        currentUserId,
        updateUserBanStatusForBlogDto,
      ),
    );
  }
}
