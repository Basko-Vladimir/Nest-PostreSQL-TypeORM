import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users/infrastructure/users.repository';
import { ClientsRequestsRepository } from './clients-requests/infrastructure/clients-requests.repository';
import { QuizAdminQuestionsRepository } from './quiz/questions/infrastructure/quiz-admin-questions.repository';

@Injectable()
export class AppService {
  constructor(
    private usersRepository: UsersRepository,
    private clientsRequestsRepository: ClientsRequestsRepository,
    private quizQuestionsRepository: QuizAdminQuestionsRepository,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async clearDatabase(): Promise<void> {
    await Promise.all([
      await this.usersRepository.deleteAllUsers(),
      await this.clientsRequestsRepository.deleteAllClientRequests(),
      await this.quizQuestionsRepository.deleteAllQuizQuestions(),
    ]);
  }
}
