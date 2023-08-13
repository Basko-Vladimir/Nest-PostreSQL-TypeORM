import { Injectable, PipeTransform } from '@nestjs/common';
import { generateCustomBadRequestException } from '../utils';
import sharp from 'sharp';

export interface IUploadFileOptions {
  type: RegExp;
  width: number;
  height: number;
  maxSize?: number;
}

@Injectable()
export class UploadFileValidator implements PipeTransform {
  constructor(private options: IUploadFileOptions) {}

  async transform(value: Express.Multer.File) {
    const { maxSize, width, height, type } = this.options;
    const defaultAllowableSize = 10000;
    const currentSizeLimit = maxSize || defaultAllowableSize;

    if (value.size > currentSizeLimit) {
      generateCustomBadRequestException(
        `maximal size of uploaded file should be ${currentSizeLimit}`,
        'file',
      );
    }

    if (!value.mimetype.match(type)) {
      generateCustomBadRequestException(
        `type of uploaded file can be ${this.options.type}`,
        'file',
      );
    }

    const sharpFile = sharp(value.buffer);
    const fileMetadata = await sharpFile.metadata();

    if (fileMetadata.width !== width || fileMetadata.height !== height) {
      generateCustomBadRequestException(
        `Incorrect image sizes. Width should be ${width} and height should be ${height}`,
        'file',
      );
    }

    return {
      ...value,
      buffer: sharpFile,
    };
  }
}
