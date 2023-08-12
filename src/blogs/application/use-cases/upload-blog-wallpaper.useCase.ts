import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CloudStorageAdapter } from '../../../common/adapters/cloud-storage.adapter';
import { EntityDirectory, ImageType } from '../../../common/enums';
import {
  FileUploadingRepository,
  IFileDataDto,
} from '../../../files-uploading/infrastructure/file-uploding.repository';

export class UploadBlogWallpaperCommand {
  constructor(public userId: string, public blogId: string, public file: any) {}
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

  async execute(command: UploadBlogWallpaperCommand): Promise<void> {
    const { userId, file, blogId } = command;

    try {
      const { url, uploadedFileId } =
        await this.cloudStorageAdapter.saveFileToCloud(
          userId,
          blogId,
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
        blogId,
      };
      const existingFileUploading =
        await this.fileUploadingRepository.getFileUploadingById(uploadedFileId);

      if (existingFileUploading) {
        await this.fileUploadingRepository.updateFileUploading(fileData);
      } else {
        await this.fileUploadingRepository.createFileUploading(fileData);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
