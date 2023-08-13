import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BearerAuthGuard } from '../../common/guards/bearer-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { User } from '../../common/decorators/user.decorator';
import { ActionsOnBlogGuard } from '../../common/guards/actions-on-blog.guard';
import { CheckExistingEntityGuard } from '../../common/guards/check-existing-entity.guard';
import { ParamIdType } from '../../common/decorators/param-id-type.decorator';
import { IdTypes, ImageType } from '../../common/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileValidator } from '../../common/validators/upload-file.validator';
import { IFileUploadingOutputModelDto } from './dto/file-uploading-output-models.dto';
import { UploadBlogImageCommand } from './application/use-cases/upload-blog-image.useCase';
import { QueryFileUploadingRepository } from '../infrastructure/query-file-uploding.repository';

@Controller('blogger/blogs/:blogId')
@UseGuards(BearerAuthGuard)
export class BloggerFileUploadingController {
  constructor(
    private queryFileUploadingRepository: QueryFileUploadingRepository,
    private commandBus: CommandBus,
  ) {}

  @Post('images/wallpaper')
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard, ActionsOnBlogGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadBlogBackgroundWallpaper(
    @UploadedFile(
      new UploadFileValidator({
        type: /(png|jpeg|jpg)$/,
        width: 1028,
        height: 312,
        maxSize: 100000,
      }),
    )
    file: Express.Multer.File,
    @User('id') userId: string,
    @Param('blogId') blogId: string,
  ): Promise<IFileUploadingOutputModelDto> {
    await this.commandBus.execute(
      new UploadBlogImageCommand(userId, blogId, file, ImageType.WALLPAPER),
    );

    return this.queryFileUploadingRepository.getBlogFileUploading(
      userId,
      blogId,
    );
  }

  @Post('images/main')
  @ParamIdType([IdTypes.BLOG_ID])
  @UseGuards(CheckExistingEntityGuard, ActionsOnBlogGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadBlogBackgroundMain(
    @UploadedFile(
      new UploadFileValidator({
        type: /(png|jpeg|jpg)$/,
        width: 156,
        height: 156,
        maxSize: 100000,
      }),
    )
    file: Express.Multer.File,
    @User('id') userId: string,
    @Param('blogId') blogId: string,
  ): Promise<IFileUploadingOutputModelDto> {
    await this.commandBus.execute(
      new UploadBlogImageCommand(userId, blogId, file, ImageType.MAIN),
    );

    return this.queryFileUploadingRepository.getBlogFileUploading(
      userId,
      blogId,
    );
  }
}
