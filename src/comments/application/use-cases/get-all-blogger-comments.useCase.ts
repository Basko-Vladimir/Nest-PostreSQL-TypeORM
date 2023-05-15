import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AllBloggerCommentsOutputModel } from '../../api/dto/comments-output-models.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CommentsQueryParamsDto } from '../../api/dto/comments-query-params.dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { QueryCommentsRepository } from '../../infrastructure/query-comments.repository';

export class GetAllBloggerCommentsQuery {
  constructor(
    public queryParams: CommentsQueryParamsDto,
    public userId: string,
  ) {}
}

@QueryHandler(GetAllBloggerCommentsQuery)
export class GetAllBloggerCommentsUseCase
  implements IQueryHandler<GetAllBloggerCommentsQuery>
{
  constructor(
    private usersRepository: UsersRepository,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private queryCommentsRepository: QueryCommentsRepository,
  ) {}

  async execute(
    query: GetAllBloggerCommentsQuery,
  ): Promise<AllBloggerCommentsOutputModel> {
    const { queryParams, userId } = query;

    return this.queryCommentsRepository.findAllBloggerComments(
      queryParams,
      userId,
    );
  }
}
