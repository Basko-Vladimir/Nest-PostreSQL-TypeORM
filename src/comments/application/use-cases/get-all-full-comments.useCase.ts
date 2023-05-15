import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { AllCommentsOutputModel } from '../../api/dto/comments-output-models.dto';
import { QueryLikesRepository } from '../../../likes/infrastructure/query-likes.repository';
import { GetFullCommentQuery } from './get-full-comment.useCase';

export class GetAllFullCommentsQuery {
  constructor(
    public allCommentsOutputModel: AllCommentsOutputModel,
    public userId: string,
  ) {}
}

@QueryHandler(GetAllFullCommentsQuery)
export class GetAllFullCommentsUseCase
  implements IQueryHandler<GetAllFullCommentsQuery>
{
  constructor(
    private queryLikesRepository: QueryLikesRepository,
    private queryBus: QueryBus,
  ) {}

  async execute(
    query: GetAllFullCommentsQuery,
  ): Promise<AllCommentsOutputModel> {
    const { allCommentsOutputModel, userId } = query;
    const comments = allCommentsOutputModel.items;
    const fullComments = [];

    for (let i = 0; i < comments.length; i++) {
      fullComments.push(
        await this.queryBus.execute(
          new GetFullCommentQuery(comments[i], userId),
        ),
      );
    }

    return {
      ...allCommentsOutputModel,
      items: fullComments,
    };
  }
}
