import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadingEntity } from '../entities/file-uploading.entity';
import { mapFileUploadingEntityToFileUploadingOutputModel } from '../mappers/file-uploading-mappers';
import { IFileUploadingOutputModelDto } from '../api/dto/file-uploading-output-models.dto';

@Injectable()
export class QueryFileUploadingRepository {
  constructor(
    @InjectRepository(FileUploadingEntity)
    private typeOrmFileUploadingRepository: Repository<FileUploadingEntity>,
  ) {}

  async getBlogFileUploading(
    userId: string,
    blogId: string,
  ): Promise<IFileUploadingOutputModelDto> {
    const fileUploadings = await this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .select('fileUploading')
      .where('"fileUploading"."userId" = :userId', { userId })
      .andWhere('"fileUploading"."blogId" = :blogId', { blogId })
      .andWhere('"fileUploading"."postId" is Null')
      .getMany();

    return mapFileUploadingEntityToFileUploadingOutputModel(fileUploadings);
  }
}
