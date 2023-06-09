import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { LikeStatus } from '../../common/enums';
import { mapLikeEntityToLikeInfoOutputModel } from '../mappers/likes-mapper';
import {
  ExtendedLikesInfoOutputModel,
  LikesInfoOutputModel,
} from '../api/dto/likes-output-models.dto';
import { LikeEntity } from '../entities/db-entities/like.entity';

@Injectable()
export class QueryLikesRepository {
  constructor(
    @InjectRepository(LikeEntity)
    private typeOrmLikeRepository: Repository<LikeEntity>,
  ) {}

  async getLikesInfo(
    userId: string,
    commentId: string,
  ): Promise<LikesInfoOutputModel> {
    const selectQueryBuilder = this.typeOrmLikeRepository
      .createQueryBuilder('like')
      .innerJoinAndSelect('like.user', 'user')
      .where('like.commentId = :commentId', { commentId })
      .andWhere('user.isBanned = :isBanned', { isBanned: false });
    let myStatus = LikeStatus.NONE;

    const likesCount = await selectQueryBuilder
      .andWhere('like.status = :status', { status: LikeStatus.LIKE })
      .getCount();
    const dislikesCount = await selectQueryBuilder
      .andWhere('like.status = :status', { status: LikeStatus.DISLIKE })
      .getCount();

    if (userId) {
      const currentUserLike = await selectQueryBuilder
        .andWhere('user.id = :userId', { userId })
        .getOne();

      myStatus = currentUserLike ? currentUserLike.status : myStatus;
    }

    return {
      likesCount,
      dislikesCount,
      myStatus,
    };
  }

  async getExtendedLikesInfo(
    userId: string | null,
    postId: string,
  ): Promise<ExtendedLikesInfoOutputModel> {
    const selectQueryBuilder = this.typeOrmLikeRepository
      .createQueryBuilder('like')
      .innerJoinAndSelect('like.user', 'user')
      .where('like.commentId is Null')
      .andWhere('user.isBanned = :isBanned', { isBanned: false })
      .andWhere('like.postId = :postId', { postId });
    let myStatus = LikeStatus.NONE;

    const likesCount = await selectQueryBuilder
      .andWhere('like.status = :status', { status: LikeStatus.LIKE })
      .getCount();
    const dislikesCount = await selectQueryBuilder
      .andWhere('like.status = :status', { status: LikeStatus.DISLIKE })
      .getCount();
    const newestLikes = await selectQueryBuilder
      .andWhere('like.status = :status', { status: LikeStatus.LIKE })
      .orderBy('like.createdAt', 'DESC')
      .limit(3)
      .getMany();

    if (userId) {
      const currentUserLike = await selectQueryBuilder
        .andWhere('user.id = :userId', { userId })
        .getOne();

      myStatus = currentUserLike ? currentUserLike.status : myStatus;
    }

    return {
      likesCount,
      dislikesCount,
      myStatus,
      newestLikes: newestLikes.map((like) =>
        mapLikeEntityToLikeInfoOutputModel(like),
      ),
    };
  }
}
