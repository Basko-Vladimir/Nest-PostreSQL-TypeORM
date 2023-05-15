import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../api/dto/create-blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { IUser } from '../../../users/entities/interfaces';
import { IBlogOutputModel } from '../../api/dto/blogs-output-models.dto';
import { mapDbBlogToBlogOutputModel } from '../../mappers/blogs-mappers';

export class CreateBlogCommand {
  constructor(public createBlogDto: CreateBlogDto, public user: IUser) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<IBlogOutputModel> {
    const { createBlogDto, user } = command;
    const createdBlog = await this.blogsRepository.createBlog(
      user.id,
      createBlogDto,
    );

    return mapDbBlogToBlogOutputModel(createdBlog);
  }
}
