import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../api/dto/create-blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { IUser } from '../../../users/entities/interfaces';

export class CreateBlogCommand {
  constructor(public createBlogDto: CreateBlogDto, public user: IUser) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<string> {
    const { createBlogDto, user } = command;
    return this.blogsRepository.createBlog(user.id, createBlogDto);
  }
}
