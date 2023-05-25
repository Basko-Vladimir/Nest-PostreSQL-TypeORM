import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users/infrastructure/users.repository';
import { DevicesSessionsRepository } from './devices-sessions/infrastructure/devices-sessions.repository';
import { ClientsRequestsRepository } from './clients-requests/infrastructure/clients-requests.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { BannedUsersForBlogsRepository } from './users/infrastructure/banned-users-for-blogs-repository.service';
import { LikesRepository } from './likes/infrastructure/likes.repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';

@Injectable()
export class AppService {
  constructor(
    private usersRepository: UsersRepository,
    private devicesSessionsRepository: DevicesSessionsRepository,
    private clientsRequestsRepository: ClientsRequestsRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private bannedUsersForBlogsRepository: BannedUsersForBlogsRepository,
    private likesRepository: LikesRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async clearDatabase(): Promise<void> {
    await Promise.all([
      await this.bannedUsersForBlogsRepository.deleteAllBannedUsersForBlogs(),
      await this.likesRepository.deleteAllLikes(),
      await this.commentsRepository.deleteAllComments(),
      await this.postsRepository.deleteAllPosts(),
      await this.usersRepository.deleteAllUsers(),
      await this.clientsRequestsRepository.deleteAllClientRequests(),
    ]);
  }
}
