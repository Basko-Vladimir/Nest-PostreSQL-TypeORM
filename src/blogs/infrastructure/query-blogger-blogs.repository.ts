import { Injectable } from '@nestjs/common';
import { BlogsQueryParamsDto } from '../api/dto/blogs-query-params.dto';
import { AllBlogsOutputModel } from '../api/dto/blogs-output-models.dto';
import { QueryBlogsRepository } from './query-blogs.repository';
import { mapBlogEntityToBlogOutputModel } from '../mappers/blogs-mappers';
import { getCommonInfoForQueryAllRequests } from '../../common/utils';

@Injectable()
export class QueryBloggerBlogsRepository extends QueryBlogsRepository {
  async findAllBlogsAsBlogger(
    queryParams: BlogsQueryParamsDto,
    userId: string,
  ): Promise<AllBlogsOutputModel> {
    const { blogs, totalCount, pageNumber, pageSize } =
      await this.getBlogsDataByQueryParams(queryParams, null, userId);

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: blogs.map(mapBlogEntityToBlogOutputModel as any),
    };
  }
}
