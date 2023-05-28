import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../common/enums';
import { LikeEntity } from '../entities/db-entities/like.entity';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectRepository(LikeEntity)
    private typeOrmLikeRepository: Repository<LikeEntity>,
  ) {}

  async getLikeByFilter(
    userId: string,
    postId: string,
    commentId: string = null,
  ): Promise<LikeEntity> {
    const selectQueryBuilder = this.typeOrmLikeRepository
      .createQueryBuilder('like')
      .select('like')
      .where('like.userId = :userId', { userId })
      .andWhere('like.postId = :postId', { postId })
      .andWhere('like.commentId is Null', { postId });

    if (commentId) {
      selectQueryBuilder.andWhere('like.commentId = :commentId', { commentId });
    } else {
      selectQueryBuilder.andWhere('like.commentId is Null');
    }

    return selectQueryBuilder.getOne();
  }

  async createLike(
    userId: string,
    postId: string,
    status: LikeStatus,
    commentId: string,
  ): Promise<void> {
    await this.typeOrmLikeRepository
      .createQueryBuilder()
      .insert()
      .into(LikeEntity)
      .values({ userId, postId, status, commentId })
      .execute();
  }

  async updateLike(
    userId: string,
    postId: string,
    status: LikeStatus,
    commentId: string,
  ): Promise<void> {
    const updateQueryBuilder = this.typeOrmLikeRepository
      .createQueryBuilder()
      .update(LikeEntity)
      .set({ status })
      .where('userId = :userId', { userId })
      .andWhere('postId = :postId', { postId });

    if (commentId) {
      updateQueryBuilder.andWhere('commentId = :commentId', { commentId });
    } else {
      updateQueryBuilder.andWhere('commentId is Null');
    }

    await updateQueryBuilder.execute();
  }
}
