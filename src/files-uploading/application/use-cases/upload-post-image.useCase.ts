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
    public defaultFile: any,
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
    const { userId, blogId, postId, defaultFile } = command;
    const middleSize = await defaultFile.buffer
      .resize({
        width: 300,
        height: 180,
        fit: 'fill',
      })
      .toBuffer();
    const smallSize = await defaultFile.buffer
      .resize({
        width: 100,
        height: 50,
        fit: 'fill',
      })
      .toBuffer();
    const files = [
      defaultFile,
      {
        ...defaultFile,
        buffer: middleSize,
      },
      {
        ...defaultFile,
        buffer: smallSize,
      },
    ];

    for (const fileItem of files) {
      try {
        const url = await this.cloudStorageAdapter.saveFileToCloud(
          userId,
          postId,
          fileItem,
          ImageType.MAIN,
          EntityDirectory.POSTS,
        );
        const metadata = await fileItem.buffer.metadata();
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
}
