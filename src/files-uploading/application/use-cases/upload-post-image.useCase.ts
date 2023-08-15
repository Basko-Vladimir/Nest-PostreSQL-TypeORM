import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudStorageAdapter } from '../../../common/adapters/cloud-storage.adapter';
import {
  FileUploadingRepository,
  IFileDataDto,
} from '../../infrastructure/file-uploding.repository';
import { EntityDirectory, ImageType } from '../../../common/enums';

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
      const url = await this.cloudStorageAdapter.saveFileToCloud(
        userId,
        postId,
        file,
        ImageType.MAIN,
        EntityDirectory.POSTS,
      );
      const metadata = await file.buffer.metadata();
      const fileData: IFileDataDto = {
        size: metadata.size,
        type: ImageType.MAIN,
        height: metadata.height,
        width: metadata.width,
        url,
        userId,
        blogId,
        postId,
      };
      const existingFileUploading =
        await this.fileUploadingRepository.getFileUploadingByUrl(url);

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
