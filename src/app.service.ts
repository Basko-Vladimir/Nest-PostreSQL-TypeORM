import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users/infrastructure/users.repository';
import { ClientsRequestsRepository } from './clients-requests/infrastructure/clients-requests.repository';
import { QuizQuestionsRepository } from './quiz/questions/infrastructure/quiz-questions.repository';

@Injectable()
export class AppService {
  constructor(
    private usersRepository: UsersRepository,
    private clientsRequestsRepository: ClientsRequestsRepository,
    private quizQuestionsRepository: QuizQuestionsRepository,
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
