import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AllBannedUsersForSpecificBlogOutputModel } from '../api/dto/banned-users-for-specific-blog-output-model.dto';
import { BannedUsersForSpecificBlogQueryParamsDto } from '../api/dto/banned-users-for-specific-blog-query-params.dto';
import { mapBannedUserForBlogEntityToBannedUserForBlogOutputModel } from '../mappers/users-mappers';
import { SortDirection, UserSortByField } from '../../common/enums';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../common/utils';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';
import { BannedUserForBlogEntity } from '../entities/db-entities/banned-user-for-blog.entity';

@Injectable()
export class QueryBloggerUsersRepository {
  constructor(
    @InjectRepository(BannedUserForBlogEntity)
    private typeOrmBannedUserForBlogRepository: Repository<BannedUserForBlogEntity>,
  ) {}

  async findAllBannedUsersForSpecificBlog(
    blogId: string,
    queryParams: BannedUsersForSpecificBlogQueryParamsDto,
  ): Promise<AllBannedUsersForSpecificBlogOutputModel> {
    const {
      sortBy = UserSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
      searchLoginTerm = '',
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const dbSortDirection = getDbSortDirection(sortDirection);
    const selectQueryBuilder = this.typeOrmBannedUserForBlogRepository
      .createQueryBuilder('bannedUserForBlog')
      .innerJoin('bannedUserForBlog.user', 'user')
      .select(['bannedUserForBlog', 'user'])
      .where('bannedUserForBlog.blogId = :blogId', { blogId })
      .andWhere('bannedUserForBlog.isBanned = true');

    if (searchLoginTerm) {
      selectQueryBuilder.andWhere('user.login ilike :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      });
    }

    const totalCount = await selectQueryBuilder.getCount();
    const bannedUsers = await selectQueryBuilder
      .orderBy(`user.${sortBy}`, dbSortDirection)
      .take(pageSize)
      .skip(skip)
      .getMany();

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: bannedUsers.map(
        mapBannedUserForBlogEntityToBannedUserForBlogOutputModel,
      ),
    };
  }
}
