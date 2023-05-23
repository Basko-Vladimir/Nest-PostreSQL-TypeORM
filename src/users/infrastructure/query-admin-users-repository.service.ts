import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersQueryParamsDto } from '../api/dto/users-query-params.dto';
import { BanStatus, SortDirection, UserSortByField } from '../../common/enums';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../common/utils';
import { mapDbUserToUserOutputModel } from '../mappers/users-mappers';
import { AllUsersOutputModel } from '../api/dto/users-output-models.dto';
import { UserEntity } from '../entities/db-entities/user.entity';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../../common/constants';

@Injectable()
export class QueryAdminUsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private typeOrmUsersRepository: Repository<UserEntity>,
  ) {}

  async findAllUsers(
    queryParams: UsersQueryParamsDto,
  ): Promise<AllUsersOutputModel> {
    const {
      searchLoginTerm = '',
      searchEmailTerm = '',
      pageNumber = DEFAULT_PAGE_NUMBER,
      pageSize = DEFAULT_PAGE_SIZE,
      sortBy = UserSortByField.createdAt,
      sortDirection = SortDirection.desc,
      banStatus = BanStatus.ALL,
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const dbSortDirection = getDbSortDirection(sortDirection);
    const selectQueryBuilder = this.typeOrmUsersRepository
      .createQueryBuilder('user')
      .select('user');

    if (searchLoginTerm) {
      selectQueryBuilder.where('user.login ilike :searchLoginTerm', {
        searchLoginTerm: `%${searchLoginTerm}%`,
      });
    }
    if (searchEmailTerm) {
      selectQueryBuilder.orWhere('user.email ilike :searchEmailTerm', {
        searchEmailTerm: `%${searchEmailTerm}%`,
      });
    }
    if (banStatus === BanStatus.BANNED || banStatus === BanStatus.NOT_BANNED) {
      selectQueryBuilder.andWhere('user.isBanned = :isBanned', {
        isBanned: banStatus === BanStatus.BANNED,
      });
    }

    const totalCount = await selectQueryBuilder.getCount();
    const users = await selectQueryBuilder
      .orderBy(`"${sortBy}"`, dbSortDirection)
      .take(pageSize)
      .skip(skip)
      .getMany();

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: users.map(mapDbUserToUserOutputModel),
    };
  }
}
