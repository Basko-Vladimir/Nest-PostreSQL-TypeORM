import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { IPostOutputModel } from '../../api/dto/posts-output-models.dto';
import { CreatePostForBlogDto } from '../../../blogs/api/dto/create-post-for-blog.dto';
import { mapDbPostToPostOutputModel } from '../../mappers/posts-mapper';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class CreatePostCommand {
  constructor(
    public createPostForBlogDto: CreatePostForBlogDto,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<IPostOutputModel> {
    const { createPostForBlogDto, blogId, userId } = command;
    const createdPost = await this.postsRepository.createPost(
      createPostForBlogDto,
      blogId,
      userId,
    );
    const targetBlog = await this.blogsRepository.findBlogById(blogId);

    return mapDbPostToPostOutputModel({
      ...createdPost,
      blogName: targetBlog.name,
    });
  }
}
