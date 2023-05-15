import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IFullPostOutputModel,
  IPostOutputModel,
} from '../../api/dto/posts-output-models.dto';
import { QueryLikesRepository } from '../../../likes/infrastructure/query-likes.repository';

export class GetFullPostQuery {
  constructor(public post: IPostOutputModel, public userId: string = null) {}
}

@QueryHandler(GetFullPostQuery)
export class GetFullPostUseCase implements IQueryHandler<GetFullPostQuery> {
  constructor(private queryLikesRepository: QueryLikesRepository) {}

  async execute(query: GetFullPostQuery): Promise<IFullPostOutputModel> {
    const { post, userId } = query;
    const extendedLikesInfo =
      await this.queryLikesRepository.getExtendedLikesInfo(userId, post.id);

    return {
      ...post,
      extendedLikesInfo,
    };
  }
}
