import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadingEntity } from '../entities/file-uploading.entity';
import { ImageType } from '../../common/enums';

export interface IFileDataDto {
  id: string;
  url: string;
  userId: string;
  type: ImageType;
  width: number;
  height: number;
  size: number;
}

@Injectable()
export class FileUploadingRepository {
  constructor(
    @InjectRepository(FileUploadingEntity)
    private typeOrmFileUploadingRepository: Repository<FileUploadingEntity>,
  ) {}

  async getFileUploadingById(
    fileId: string,
  ): Promise<FileUploadingEntity | null> {
    return this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .select('fileUploading')
      .where('fileUploading.id = :fileId', { fileId })
      .getOne();
  }

  async createFileUploading(fileData: IFileDataDto): Promise<void> {
    const { id, url, userId, width, height, size, type } = fileData;

    await this.typeOrmFileUploadingRepository
      .createQueryBuilder()
      .insert()
      .into(FileUploadingEntity)
      .values({ id, url, userId, width, height, size, type })
      .execute();
  }

  async updateFileUploading(fileData: IFileDataDto): Promise<void> {
    const { id, url, userId, width, height, size, type } = fileData;

    await this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .update()
      .set({ url, userId, width, height, size, type })
      .where('fileUploading.id = :id', { id })
      .execute();
  }
}
