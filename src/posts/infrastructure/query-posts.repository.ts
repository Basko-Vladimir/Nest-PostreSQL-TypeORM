import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostsQueryParamsDto } from '../api/dto/posts-query-params.dto';
import {
  AllPostsOutputModel,
  IFullPostOutputModel,
} from '../api/dto/posts-output-models.dto';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../common/utils';
import { LikeStatus, PostSortByField, SortDirection } from '../../common/enums';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';
import {
  mapPostEntityToPostOutputModel,
  RawFullPost,
} from '../mappers/posts-mapper';
import { PostEntity } from '../entities/db-entities/post.entity';
import { LikeEntity } from '../../likes/entities/db-entities/like.entity';

@Injectable()
export class QueryPostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(PostEntity)
    private typeOrmPostRepository: Repository<RawFullPost>,
    @InjectRepository(LikeEntity)
    private typeOrmLikeRepository: Repository<LikeEntity>,
  ) {}

  async findAllPosts(
    queryParams: PostsQueryParamsDto,
    blogId?: string,
    userId?: string,
  ): Promise<AllPostsOutputModel> {
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      pageNumber = DEFAULT_PAGE_NUMBER,
      sortBy = PostSortByField.createdAt,
      sortDirection = SortDirection.desc,
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const sortByValue =
      sortBy === PostSortByField.blogName ? 'blog.name' : `post.${sortBy}`;

    const selectQueryBuilder = this.typeOrmPostRepository
      .createQueryBuilder('post')
      .innerJoin('post.blog', 'blog')
      .innerJoin('post.user', 'user') //TODO need to rework we need user of every Like, but not such who created post
      .leftJoinAndSelect(
        'post.uploadedFiles',
        'fileUploading',
        `fileUploading.blogId = blog.id
          AND fileUploading.postId = post.id
          AND fileUploading.userId = user.id`,
      )
      .leftJoinAndMapOne(
        'post.myLike',
        LikeEntity,
        'myLike',
        'post.id = myLike.postId and myLike.userId = :userId',
        { userId },
      )
      .leftJoinAndMapMany(
        'post.newestLikes',
        'like',
        'newestLike',
        'post.id = newestLike.postId and newestLike.status = :likeStatus',
        { likeStatus: LikeStatus.LIKE },
      )
      .loadRelationCountAndMap('post.likesCount', 'post.likes', 'like', (qb) =>
        qb.where('like.status = :likeStatus', {
          likeStatus: LikeStatus.LIKE,
        }),
      )
      .loadRelationCountAndMap(
        'post.dislikesCount',
        'post.likes',
        'like',
        (qb) =>
          qb.where('like.status = :likeStatus', {
            likeStatus: LikeStatus.DISLIKE,
          }),
      )
      .select([
        'post',
        'blog.name',
        'user.login', //TODO need to rework we need user of every Like, but not such who created post
        'myLike.status',
        'newestLike',
        'fileUploading',
      ])
      .where('blog.isBanned = :isBanned', { isBanned: false });
    const dbSortDirection = getDbSortDirection(sortDirection);

    if (blogId) {
      selectQueryBuilder.andWhere('post.blogId = :blogId', { blogId });
    }

    const totalCount = await selectQueryBuilder.getCount();
    const posts = await selectQueryBuilder
      .orderBy(sortByValue, dbSortDirection)
      .take(pageSize)
      .skip(skip)
      .getMany();

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: posts.map(mapPostEntityToPostOutputModel),
    };
  }

  async findPostById(
    postId: string,
    userId: string,
  ): Promise<IFullPostOutputModel> {
    const newestLikes = await this.typeOrmLikeRepository
      .createQueryBuilder('like')
      .innerJoin('like.user', 'user')
      .select(['like', 'user.login'])
      .where('like.postId = :postId', { postId })
      .andWhere('like.status = :status', { status: LikeStatus.LIKE })
      .orderBy('like.createdAt', 'DESC')
      .limit(3)
      .getMany();

    const targetPost = await this.typeOrmPostRepository
      .createQueryBuilder('post')
      .innerJoin('post.blog', 'blog')
      .innerJoin('post.user', 'user')
      .leftJoinAndSelect(
        'post.uploadedFiles',
        'fileUploading',
        `fileUploading.blogId = blog.id
          AND fileUploading.postId = post.id
          AND fileUploading.userId = user.id`,
      )
      .leftJoinAndMapOne(
        'post.myLike',
        LikeEntity,
        'myLike',
        'post.id = myLike.postId and myLike.userId = :userId',
        { userId },
      )
      .loadRelationCountAndMap('post.likesCount', 'post.likes', 'like', (qb) =>
        qb.where('like.status = :likeStatus', {
          likeStatus: LikeStatus.LIKE,
        }),
      )
      .loadRelationCountAndMap(
        'post.dislikesCount',
        'post.likes',
        'like',
        (qb) =>
          qb.where('like.status = :likeStatus', {
            likeStatus: LikeStatus.DISLIKE,
          }),
      )
      .select(['post', 'blog.name', 'myLike.status', 'fileUploading'])
      .where('post.id = :postId', { postId })
      .andWhere('blog.isBanned = :isBanned', { isBanned: false })
      .getOne();

    return mapPostEntityToPostOutputModel({ ...targetPost, newestLikes });
  }
}
