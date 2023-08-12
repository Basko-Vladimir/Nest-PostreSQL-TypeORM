// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { FileUploadingEntity } from '../entities/file-uploading.entity';
//
// @Injectable()
// export class QueryFileUploadingRepository {
//   constructor(
//     @InjectRepository(FileUploadingEntity)
//     private typeOrmFileUploadingRepository: Repository<FileUploadingEntity>,
//   ) {}
//
//   async getFileUploadingById(
//     fileId: string,
//   ): Promise<FileUploadingEntity | null> {
//     const fileUploading = await this.typeOrmFileUploadingRepository
//       .createQueryBuilder('fileUploading')
//       .select('fileUploading')
//       .where('fileUploading.id = :fileId', { fileId })
//       .getOne();
//
//     return map;
//   }
// }
