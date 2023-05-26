import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CreatePostForBlogDto } from '../../../blogs/api/dto/create-post-for-blog.dto';

export class CreatePostCommand {
  constructor(
    public createPostForBlogDto: CreatePostForBlogDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const { createPostForBlogDto, blogId, userId } = command;

    return this.postsRepository.createPost(
      createPostForBlogDto,
      blogId,
      userId,
    );
  }
}
