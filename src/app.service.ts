import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users/infrastructure/users.repository';
import { DevicesSessionsRepository } from './devices-sessions/infrastructure/devices-sessions.repository';
import { ClientsRequestsRepository } from './clients-requests/infrastructure/clients-requests.repository';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';

@Injectable()
export class AppService {
  constructor(
    private usersRepository: UsersRepository,
    private devicesSessionsRepository: DevicesSessionsRepository,
    private clientsRequestsRepository: ClientsRequestsRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async clearDatabase(): Promise<void> {
    await Promise.all([
      await this.postsRepository.deleteAllPosts(),
      await this.usersRepository.deleteAllUsers(),
      await this.clientsRequestsRepository.deleteAllClientRequests(),
    ]);
  }
}
