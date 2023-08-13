import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../../blogs/infrastructure/blogs.repository';
import { CloudStorageAdapter } from '../../../../common/adapters/cloud-storage.adapter';
import { EntityDirectory, ImageType } from '../../../../common/enums';
import {
  FileUploadingRepository,
  IFileDataDto,
} from '../../../infrastructure/file-uploding.repository';

export class UploadBlogImageCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public file: any,
    public imageType: ImageType,
  ) {}
}

@CommandHandler(UploadBlogImageCommand)
export class UploadBlogImageUseCase
  implements ICommandHandler<UploadBlogImageCommand>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private cloudStorageAdapter: CloudStorageAdapter,
    private fileUploadingRepository: FileUploadingRepository,
  ) {}

  async execute(command: UploadBlogImageCommand): Promise<void> {
    const { userId, file, blogId, imageType } = command;

    try {
      const { url, uploadedFileId } =
        await this.cloudStorageAdapter.saveFileToCloud(
          userId,
          blogId,
          file,
          imageType,
          EntityDirectory.BLOGS,
        );
      const metadata = await file.buffer.withMetadata();
      const fileData: IFileDataDto = {
        id: uploadedFileId,
        size: file.size,
        type: imageType,
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