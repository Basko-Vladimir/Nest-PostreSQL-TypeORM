import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  AllBloggerCommentsOutputModel,
  AllCommentsOutputModel,
  ICommentOutputModel,
} from '../api/dto/comments-output-models.dto';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../common/utils';
import {
  mapCommentEntityToBloggerCommentOutputModel,
  mapCommentEntityToCommentOutputModel,
} from '../mappers/comments-mapper';
import {
  CommentSortByField,
  LikeStatus,
  SortDirection,
} from '../../common/enums';
import { CommentsQueryParamsDto } from '../api/dto/comments-query-params.dto';
import { QueryLikesRepository } from '../../likes/infrastructure/query-likes.repository';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';
import { CommentEntity } from '../entities/db-entities/comment.entity';
import { LikeEntity } from '../../likes/entities/db-entities/like.entity';
import { IRawCommentWithLikeInfo } from '../entities/interfaces';

interface ICommentsDataByQueryParams {
  comments: CommentEntity[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
}

@Injectable()
export class QueryCommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private queryLikesRepository: QueryLikesRepository,
    @InjectRepository(CommentEntity)
    private typeOrmCommentRepository: Repository<CommentEntity>,
    @InjectRepository(CommentEntity)
    private typeOrmBloggerCommentsRepository: Repository<IRawCommentWithLikeInfo>,
  ) {}

  async findAllComments(
    queryParams: CommentsQueryParamsDto,
    postId?: string,
  ): Promise<AllCommentsOutputModel> {
    const { pageSize, pageNumber, comments, totalCount } =
      await this.getCommentsDataByFilters(queryParams, false, postId);

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: comments.map(mapCommentEntityToCommentOutputModel),
    };
  }

  async findAllBloggerComments(
    queryParams: CommentsQueryParamsDto,
    userId: string,
  ): Promise<AllBloggerCommentsOutputModel> {
    const {
      sortBy = CommentSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageSize = DEFAULT_PAGE_SIZE,
      pageNumber = DEFAULT_PAGE_NUMBER,
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const dbSortDirection = getDbSortDirection(sortDirection);
    const selectQueryBuilder = this.typeOrmBloggerCommentsRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.post', 'post', 'comment.postId = post.id')
      .innerJoinAndSelect('post.blog', 'blog', 'post.blogId = blog.id')
      .innerJoinAndSelect('comment.user', 'user', 'comment.authorId = user.id')
      .leftJoinAndMapOne(
        'comment.myLike',
        LikeEntity,
        'myLike',
        'comment.id = myLike.commentId and post.id = myLike.postId and myLike.userId = :userId',
        { userId },
      )
      .loadRelationCountAndMap(
        'comment.likesCount',
        'comment.likes',
        'like',
        (qb) =>
          qb.where('like.status = :likeStatus', {
            likeStatus: LikeStatus.LIKE,
          }),
      )
      .loadRelationCountAndMap(
        'comment.dislikesCount',
        'comment.likes',
        'like',
        (qb) =>
          qb.where('like.status = :likeStatus', {
            likeStatus: LikeStatus.DISLIKE,
          }),
      )
      .select([
        'comment',
        'post.title',
        'blog.id',
        'blog.name',
        'user.login',
        'myLike.status',
      ])
      .where('user.isBanned = false')
      .andWhere('blog.ownerId = :userId', { userId });

    const totalCount = await selectQueryBuilder.getCount();
    const bloggerComments = await selectQueryBuilder
      .orderBy(`comment.${sortBy}`, dbSortDirection)
      .take(pageSize)
      .skip(skip)
      .getMany();

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: bloggerComments.map(mapCommentEntityToBloggerCommentOutputModel),
    };
  }

  async findCommentById(commentId: string): Promise<ICommentOutputModel> {
    const targetComment = await this.typeOrmCommentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'user')
      .where('comment.id = :commentId', { commentId })
      .andWhere('user.isBanned = :isBanned', { isBanned: false })
      .getOne();

    return mapCommentEntityToCommentOutputModel(targetComment);
  }

  private async getCommentsDataByFilters(
    queryParams: CommentsQueryParamsDto,
    isBanned?: boolean,
    postId?: string,
  ): Promise<ICommentsDataByQueryParams> {
    const {
      sortBy = CommentSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
    } = queryParams;
    const offset = countSkipValue(pageNumber, pageSize);
    const dbSortDirection = getDbSortDirection(sortDirection);
    const selectQueryBuilder = this.typeOrmCommentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'user');

    if (isBanned) {
      selectQueryBuilder.where('user.isBanned = :isBanned', { isBanned });
    }
    if (postId) {
      selectQueryBuilder.andWhere('comment.postId = :postId', { postId });
    }

    const totalCount = await selectQueryBuilder.getCount();
    const comments = await selectQueryBuilder
      .orderBy(`comment.${sortBy}`, dbSortDirection)
      .offset(offset)
      .limit(pageSize)
      .getMany();

    return {
      comments,
      totalCount,
      pageNumber,
      pageSize,
    };
  }
}
