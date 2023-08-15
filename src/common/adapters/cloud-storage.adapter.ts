import { Injectable } from '@nestjs/common';
import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { EntityDirectory, ImageType } from '../enums';
import { FileUploadingRepository } from '../../files-uploading/infrastructure/file-uploding.repository';

@Injectable()
export class CloudStorageAdapter {
  s3Client: S3Client;
  bucketName = 'devbucket1';

  constructor(private fileUploadingRepository: FileUploadingRepository) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'https://storage.yandexcloud.net/',
      credentials: {
        accessKeyId: 'YCAJE1Ho7i6dVi5dSQhchDU8l',
        secretAccessKey: 'YCNnABObDqEKdWTNaihcHMJEb3WbHATy9Rd0fzMg',
      },
    });
  }

  async saveFileToCloud(
    userId: string,
    entityId: string,
    file: Express.Multer.File,
    imageType: ImageType,
    entityDirectory: EntityDirectory,
    fileName: string,
  ): Promise<string> {
    const key = `content/users/${userId}/${entityDirectory}/${entityId}/${imageType}/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      return key;
    } catch (err) {
      console.error(err);
    }
  }

  async clearBucket(): Promise<void> {
    const filesUrls =
      await this.fileUploadingRepository.getAllFileUploadingUrls();
    const deletingObjects = filesUrls.map((item) => ({ Key: item.url }));
    const command = new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: deletingObjects,
      },
    });

    try {
      const { Deleted } = await this.s3Client.send(command);
      console.log(
        `Successfully deleted ${Deleted.length} objects from S3 bucket. Deleted objects:`,
      );
    } catch (err) {
      console.error(err);
    }
  }
}
