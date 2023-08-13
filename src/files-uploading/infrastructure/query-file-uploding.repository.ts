import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUploadingEntity } from '../entities/file-uploading.entity';
import {
  mapBlogFileUploadingEntityToBlogFileUploadingOutputModel,
  mapPostFileUploadingEntityToPostFileUploadingOutputModel,
} from '../mappers/file-uploading-mappers';
import {
  IBlogFileUploadingOutputModelDto,
  IPostFileUploadingOutputModelDto,
} from '../api/dto/file-uploading-output-models.dto';

@Injectable()
export class QueryFileUploadingRepository {
  constructor(
    @InjectRepository(FileUploadingEntity)
    private typeOrmFileUploadingRepository: Repository<FileUploadingEntity>,
  ) {}

  async getAllBlogFilesUploading(
    userId: string,
    blogId: string,
  ): Promise<IBlogFileUploadingOutputModelDto> {
    const fileUploadings = await this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .select('fileUploading')
      .where('"fileUploading"."userId" = :userId', { userId })
      .andWhere('"fileUploading"."blogId" = :blogId', { blogId })
      .andWhere('"fileUploading"."postId" is Null')
      .getMany();

    return mapBlogFileUploadingEntityToBlogFileUploadingOutputModel(
      fileUploadings,
    );
  }

  async getAllPostFilesUploading(
    userId: string,
    blogId: string,
    postId: string,
  ): Promise<IPostFileUploadingOutputModelDto> {
    const fileUploadings = await this.typeOrmFileUploadingRepository
      .createQueryBuilder('fileUploading')
      .select('fileUploading')
      .where('"fileUploading"."userId" = :userId', { userId })
      .andWhere('"fileUploading"."blogId" = :blogId', { blogId })
      .andWhere('"fileUploading"."postId" = :postId', { postId })
      .getMany();

    return mapPostFileUploadingEntityToPostFileUploadingOutputModel(
      fileUploadings,
    );
  }
}
