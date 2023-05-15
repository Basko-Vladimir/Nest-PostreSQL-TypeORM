import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../api/dto/update-blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(public blogId: string, public updateBlogDto: UpdateBlogDto) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const { blogId, updateBlogDto } = command;

    return this.blogsRepository.updateBlog(blogId, updateBlogDto);

    // const targetBlog = await this.blogsRepository.findBlogById(command.blogId);

    // targetBlog.updateBlog(command.updateBlogDto);
    // await this.blogsRepository.saveBlog(targetBlog);
  }
}
