import { Injectable } from '@nestjs/common';
import { BlogsQueryParamsDto } from '../api/dto/blogs-query-params.dto';

import { AllBlogsForAdminOutputModel } from '../api/dto/blogs-output-models.dto';
import { mapBlogEntityToBlogForAdminOutputModel } from '../mappers/blogs-mappers';
import { QueryBlogsRepository } from './query-blogs.repository';
import { getCommonInfoForQueryAllRequests } from '../../common/utils';

@Injectable()
export class QueryAdminBlogsRepository extends QueryBlogsRepository {
  async findAllBlogsAsAdmin(
    queryParams: BlogsQueryParamsDto,
  ): Promise<AllBlogsForAdminOutputModel> {
    const { blogs, totalCount, pageNumber, pageSize } =
      await this.getBlogsDataByQueryParams(queryParams);

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: blogs.map(mapBlogEntityToBlogForAdminOutputModel),
    };
  }
}
