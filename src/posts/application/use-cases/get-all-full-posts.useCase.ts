import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { BlogAllFullPostsOutputModel } from '../../../blogs/api/dto/blogs-output-models.dto';
import { AllPostsOutputModel } from '../../api/dto/posts-output-models.dto';
import { GetFullPostQuery } from './get-full-post.useCase';

export class GetAllFullPostsQuery {
  constructor(
    public allPostsOutputModel: AllPostsOutputModel,
    public userId: string,
  ) {}
}

@QueryHandler(GetAllFullPostsQuery)
export class GetAllFullPostsUseCase
  implements IQueryHandler<GetAllFullPostsQuery>
{
  constructor(private queryBus: QueryBus) {}

  async execute(
    query: GetAllFullPostsQuery,
  ): Promise<BlogAllFullPostsOutputModel> {
    const { allPostsOutputModel, userId } = query;
    const posts = allPostsOutputModel.items;
    const fullPosts = [];

    for (let i = 0; i < posts.length; i++) {
      fullPosts.push(
        await this.queryBus.execute(new GetFullPostQuery(posts[i], userId)),
      );
    }

    return {
      ...allPostsOutputModel,
      items: fullPosts,
    };
  }
}
