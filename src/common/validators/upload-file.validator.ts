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

  transform(value: Express.Multer.File) {
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

    const updatedFile = sharp(value.buffer).resize({ width, height });

    return {
      ...value,
      buffer: updatedFile,
    };
  }
}
