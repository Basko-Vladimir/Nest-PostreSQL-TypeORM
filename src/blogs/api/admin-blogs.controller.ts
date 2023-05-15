import { CommandBus } from '@nestjs/cqrs';
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
import { BasicAuthGuard } from '../../common/guards/basic-auth.guard';
import { BlogsQueryParamsDto } from './dto/blogs-query-params.dto';
import { AllBlogsForAdminOutputModel } from './dto/blogs-output-models.dto';
import { QueryBlogsRepository } from '../infrastructure/query-blogs.repository';
import { BindBlogWithUserGuard } from '../../common/guards/bind-blog-with-user.guard';
import { BindBlogWithUserCommand } from '../application/use-cases/bind-blog-with-user.useCase';
import { QueryAdminBlogsRepository } from '../infrastructure/query-admin-blogs.repository';
import { UpdateBlogBanStatusDto } from './dto/update-blog-ban-status.dto';
import { UpdateBlogBanStatusCommand } from '../application/use-cases/update-blog-ban-status.useCase';
import { ParamIdType } from '../../common/decorators/param-id-type.decorator';
import { IdTypes } from '../../common/enums';
import { CheckExistingEntityGuard } from '../../common/guards/check-existing-entity.guard';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class AdminBlogsController {
  constructor(
    private queryBlogsRepository: QueryBlogsRepository,
    private queryAdminBlogsRepository: QueryAdminBlogsRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async findAllBlogsAsAdmin(
    @Query() query: BlogsQueryParamsDto,
  ): Promise<AllBlogsForAdminOutputModel> {
    return this.queryAdminBlogsRepository.findAllBlogsAsAdmin(query);
  }

  @Put(':id/bind-with-user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard, BindBlogWithUserGuard)
  async bindBlogWithUser(
    @Param('userId') userId: string,
    @Param('id') blogId: string,
  ): Promise<void> {
    return this.commandBus.execute(new BindBlogWithUserCommand(blogId, userId));
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard, BasicAuthGuard)
  async updateBlogBanStatus(
    @Body() updateBlogBanStatusDto: UpdateBlogBanStatusDto,
    @Param('id')
    blogId: string,
  ): Promise<void> {
    const { isBanned } = updateBlogBanStatusDto;

    return this.commandBus.execute(
      new UpdateBlogBanStatusCommand(blogId, isBanned),
    );
  }
}
