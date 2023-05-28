import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  AllBloggerCommentsOutputModel,
  AllCommentsOutputModel,
  IBloggerCommentOutputModel,
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
import { CommentSortByField, SortDirection } from '../../common/enums';
import { CommentsQueryParamsDto } from '../api/dto/comments-query-params.dto';
import { QueryLikesRepository } from '../../likes/infrastructure/query-likes.repository';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';
import { CommentEntity } from '../entities/db-entities/comment.entity';

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
    const { sortBy, sortDirection, pageSize, pageNumber } = queryParams;
    const offset = countSkipValue(pageNumber, pageSize);

    const countResult = await this.dataSource.query(
      ` SELECT COUNT(DISTINCT "comment"."content")
        FROM "comment"
          INNER JOIN "user" ON "user"."id" = "comment"."authorId"
          INNER JOIN "post" ON "post"."userId" = "comment"."authorId"
          INNER JOIN "blog" ON "post"."userId" = "blog"."ownerId"
          WHERE "comment"."authorId" = $1 AND "user"."isBanned" = false
      `,
      [userId],
    );
    const totalCount = countResult[0].count;
    const comments = await this.dataSource.query(
      ` SELECT *
        FROM (
            SELECT DISTINCT ON ("comment"."content")
              "comment"."id",
              "comment"."createdAt",
              "comment"."updatedAt",
              "comment"."content",
              "comment"."authorId",
              "comment"."postId",
              "post"."title" as "postTitle",
              "blog"."id" as "blogId",
              "blog"."name" as "blogName",
              "user"."login" as "userLogin"
            FROM "comment"
            INNER JOIN "user" ON "user"."id" = "comment"."authorId"
              INNER JOIN "post" ON "post"."userId" = "comment"."authorId"
              INNER JOIN "blog" ON "post"."userId" = "blog"."ownerId"
              WHERE "comment"."authorId" = $1 AND "user"."isBanned" = false
              ORDER BY "comment"."content") t
        ORDER BY
          CASE
            WHEN $2 = 'asc' THEN
              CASE
                WHEN $3 = '${CommentSortByField.content}' THEN t."content"
                ELSE t."createdAt"::varchar
              END
            END ASC,
          CASE
            WHEN $2 = 'desc' THEN
              CASE
                WHEN $3 = '${CommentSortByField.content}' THEN t."content"
                ELSE t."createdAt"::varchar
              END
            END DESC
        OFFSET $4 LIMIT $5
      `,
      [userId, sortBy, sortDirection, offset, pageSize],
    );
    const bloggerComments: IBloggerCommentOutputModel[] = [];

    for (let i = 0; i < comments.length; i++) {
      const likesInfo = await this.queryLikesRepository.getLikesInfo(
        userId,
        comments[i].id,
      );

      bloggerComments.push(
        mapCommentEntityToBloggerCommentOutputModel(comments[i], likesInfo),
      );
    }

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: bloggerComments,
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
    const skip = countSkipValue(pageNumber, pageSize);
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
      .skip(skip)
      .take(pageSize)
      .getMany();

    return {
      comments,
      totalCount,
      pageNumber,
      pageSize,
    };
  }
}
