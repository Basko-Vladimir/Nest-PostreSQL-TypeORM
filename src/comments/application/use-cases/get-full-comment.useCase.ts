import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ICommentOutputModel,
  ICommentWithLikeInfoOutputModel,
} from '../../api/dto/comments-output-models.dto';
import { QueryLikesRepository } from '../../../likes/infrastructure/query-likes.repository';

export class GetFullCommentQuery {
  constructor(public comment: ICommentOutputModel, public userId: string) {}
}

@QueryHandler(GetFullCommentQuery)
export class GetFullCommentUseCase
  implements IQueryHandler<GetFullCommentQuery>
{
  constructor(private queryLikesRepository: QueryLikesRepository) {}

  async execute(
    query: GetFullCommentQuery,
  ): Promise<ICommentWithLikeInfoOutputModel> {
    const { comment, userId } = query;
    const likesInfo = await this.queryLikesRepository.getLikesInfo(
      userId,
      comment.id,
    );

    return { ...comment, likesInfo };
  }
}
