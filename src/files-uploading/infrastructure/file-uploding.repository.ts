import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadingEntity } from '../entities/file-uploading.entity';
import { ImageType } from '../../common/enums';

export interface IFileDataDto {
  url: string;
  userId: string;
  blogId: string;
  postId?: string;
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

  async getAllFileUploadingUrls(): Promise<FileUploadingEntity[]> {
    return this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .select('fileUploading.url')
      .getMany();
  }

  async getFileUploadingByUrl(
    url: string,
  ): Promise<FileUploadingEntity | null> {
    return this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .select('fileUploading')
      .where('"fileUploading".url = :url', { url })
      .getOne();
  }

  async createFileUploading(fileData: IFileDataDto): Promise<void> {
    const { url, userId, blogId, width, height, size, type, postId } = fileData;

    await this.typeOrmFileUploadingRepository
      .createQueryBuilder()
      .insert()
      .into(FileUploadingEntity)
      .values({ url, userId, blogId, width, height, size, type, postId })
      .execute();
  }

  async updateFileUploading(fileData: IFileDataDto): Promise<void> {
    const { url, userId, blogId, width, height, size, type, postId } = fileData;

    await this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .update()
      .set({ userId, blogId, width, height, size, type, postId })
      .where('"fileUploading".url = :url', { url })
      .execute();
  }

  async deleteAllFileUploadings(): Promise<void> {
    await this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .delete()
      .from(FileUploadingEntity)
      .execute();
  }
}
