import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PostsQueryParamsDto } from '../api/dto/posts-query-params.dto';
import { IPostOutputModel } from '../api/dto/posts-output-models.dto';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../common/utils';
import { LikeStatus, PostSortByField, SortDirection } from '../../common/enums';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';
import {
  mapPostEntityToPostOutputModel,
  NEWmapPostEntityToPostOutputModel,
  RawFullPost,
} from '../mappers/posts-mapper';
import { PostEntity } from '../entities/db-entities/post.entity';
import { LikeEntity } from '../../likes/entities/db-entities/like.entity';

@Injectable()
export class QueryPostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(PostEntity)
    private NEWtypeOrmPostRepository: Repository<RawFullPost>,
    @InjectRepository(PostEntity)
    private typeOrmPostRepository: Repository<PostEntity>,
    @InjectRepository(LikeEntity)
    private typeOrmLikeRepository: Repository<LikeEntity>,
  ) {}

  async findAllPosts(
    queryParams: PostsQueryParamsDto,
    blogId?: string,
    userId?: string,
  ): Promise<any> {
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      pageNumber = DEFAULT_PAGE_NUMBER,
      sortBy = PostSortByField.createdAt,
      sortDirection = SortDirection.desc,
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);

    const selectQueryBuilder = this.NEWtypeOrmPostRepository.createQueryBuilder(
      'post',
    )
      .innerJoin('post.blog', 'blog')
      .innerJoin('post.user', 'user')
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
        'user.login',
        'myLike.status',
        'newestLike',
      ])
      .where('blog.isBanned = :isBanned', { isBanned: false });
    const dbSortDirection = getDbSortDirection(sortDirection);

    if (blogId) {
      selectQueryBuilder.andWhere('post.blogId = :blogId', { blogId });
    }

    const totalCount = await selectQueryBuilder.getCount();
    const posts = await selectQueryBuilder
      .orderBy(`post.${sortBy}`, dbSortDirection)
      .take(pageSize)
      .skip(skip)
      .getMany();

    console.log(posts);

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: posts.map(NEWmapPostEntityToPostOutputModel),
    };
  }

  async findPostById(postId: string): Promise<IPostOutputModel> {
    const targetPost = await this.typeOrmPostRepository
      .createQueryBuilder('post')
      .innerJoin('post.blog', 'blog')
      .select(['post', 'blog.name'])
      .where('post.id = :postId', { postId })
      .andWhere('blog.isBanned = :isBanned', { isBanned: false })
      .getOne();

    return mapPostEntityToPostOutputModel(targetPost);
  }
}
