import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudStorageAdapter } from '../../../../common/adapters/cloud-storage.adapter';
import {
  FileUploadingRepository,
  IFileDataDto,
} from '../../../infrastructure/file-uploding.repository';
import { EntityDirectory, ImageType } from '../../../../common/enums';

export class UploadPostImageCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public postId: string,
    public file: any,
  ) {}
}

@CommandHandler(UploadPostImageCommand)
export class UploadPostImageUseCase
  implements ICommandHandler<UploadPostImageCommand>
{
  constructor(
    private cloudStorageAdapter: CloudStorageAdapter,
    private fileUploadingRepository: FileUploadingRepository,
  ) {}

  async execute(command: UploadPostImageCommand): Promise<void> {
    const { userId, blogId, postId, file } = command;

    try {
      const { url, uploadedFileId } =
        await this.cloudStorageAdapter.saveFileToCloud(
          userId,
          blogId,
          file,
          ImageType.MAIN,
          EntityDirectory.POSTS,
        );
      const metadata = await file.buffer.withMetadata();
      const fileData: IFileDataDto = {
        id: uploadedFileId,
        size: file.size,
        type: ImageType.MAIN,
        height: metadata.options.height,
        width: metadata.options.width,
        url,
        userId,
        blogId,
        postId,
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
