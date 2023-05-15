import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogBanStatusCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(UpdateBlogBanStatusCommand)
export class UpdateBlogBanStatusUseCase
  implements ICommandHandler<UpdateBlogBanStatusCommand>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogBanStatusCommand): Promise<void> {
    const { isBanned, blogId } = command;
    const banDate = isBanned ? new Date().toISOString() : null;
    const isBannedValue = typeof isBanned === 'boolean' ? isBanned : false;

    return this.blogsRepository.updateBlogBanStatus(
      blogId,
      isBannedValue,
      banDate,
    );
  }
}
