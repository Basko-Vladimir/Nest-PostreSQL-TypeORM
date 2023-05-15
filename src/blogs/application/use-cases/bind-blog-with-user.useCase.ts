import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: BindBlogWithUserCommand): Promise<void> {
    const { userId, blogId } = command;

    return this.blogsRepository.bindBlogWithUser(blogId, userId);
  }
}
