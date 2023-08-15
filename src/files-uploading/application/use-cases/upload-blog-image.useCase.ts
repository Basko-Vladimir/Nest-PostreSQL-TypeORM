import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { EntityDirectory, ImageType } from '../../../common/enums';
import { CloudStorageAdapter } from '../../../common/adapters/cloud-storage.adapter';
import {
  FileUploadingRepository,
  IFileDataDto,
} from '../../infrastructure/file-uploding.repository';

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
    private cloudStorageAdapter: CloudStorageAdapter,
    private fileUploadingRepository: FileUploadingRepository,
  ) {}

  async execute(command: UploadBlogImageCommand): Promise<void> {
    const { userId, file, blogId, imageType } = command;

    try {
      const uuid = uuidv4();
      const url = await this.cloudStorageAdapter.saveFileToCloud(
        userId,
        blogId,
        file,
        imageType,
        EntityDirectory.BLOGS,
        uuid,
      );
      const metadata = await file.buffer.metadata();
      const fileData: IFileDataDto = {
        id: uuid,
        size: metadata.size,
        type: imageType,
        height: metadata.height,
        width: metadata.width,
        url,
        userId,
        blogId,
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
