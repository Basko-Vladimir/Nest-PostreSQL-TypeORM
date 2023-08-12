import { Injectable } from '@nestjs/common';
import {
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { EntityDirectory, ImageType } from '../enums';

@Injectable()
export class CloudStorageAdapter {
  s3Client: S3Client;

  constructor() {
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
    file: Express.Multer.File,
    imageType: ImageType,
    entityDirectory: EntityDirectory,
  ): Promise<{ url: string; uploadedFileId: string }> {
    const key = `content/users/${userId}/${entityDirectory}/${imageType}/${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: 'devbucket1',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      const uploadedFileResult: PutObjectCommandOutput =
        await this.s3Client.send(command);

      return {
        url: key,
        uploadedFileId: uploadedFileResult.ETag,
      };
    } catch (err) {
      console.error(err);
    }
  }
}
