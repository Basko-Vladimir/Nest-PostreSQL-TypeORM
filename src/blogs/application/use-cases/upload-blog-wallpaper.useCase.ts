import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CloudStorageAdapter } from '../../../common/adapters/cloud-storage.adapter';
import { EntityDirectory, ImageType } from '../../../common/enums';
import {
  FileUploadingRepository,
  IFileDataDto,
} from '../../../files-uploading/infrastructure/file-uploding.repository';
import { FileUploadingEntity } from '../../../files-uploading/entities/file-uploading.entity';

export class UploadBlogWallpaperCommand {
  constructor(public userId: string, public file: any) {}
}

@CommandHandler(UploadBlogWallpaperCommand)
export class UploadBlogWallpaperUseCase
  implements ICommandHandler<UploadBlogWallpaperCommand>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private cloudStorageAdapter: CloudStorageAdapter,
    private fileUploadingRepository: FileUploadingRepository,
  ) {}

  async execute(
    command: UploadBlogWallpaperCommand,
  ): Promise<FileUploadingEntity> {
    const { userId, file } = command;

    try {
      const { url, uploadedFileId } =
        await this.cloudStorageAdapter.saveFileToCloud(
          userId,
          file,
          ImageType.WALLPAPER,
          EntityDirectory.BLOGS,
        );
      const metadata = await file.buffer.withMetadata();
      const fileData: IFileDataDto = {
        id: uploadedFileId,
        size: file.size,
        type: ImageType.WALLPAPER,
        height: metadata.options.height,
        width: metadata.options.width,
        url,
        userId,
      };
      const existingFileUploading =
        await this.fileUploadingRepository.getFileUploadingById(uploadedFileId);

      if (existingFileUploading) {
        await this.fileUploadingRepository.updateFileUploading(fileData);
      } else {
        await this.fileUploadingRepository.createFileUploading(fileData);
      }

      return this.fileUploadingRepository.getFileUploadingById(uploadedFileId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
