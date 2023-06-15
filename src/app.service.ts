import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users/infrastructure/users.repository';
import { ClientsRequestsRepository } from './clients-requests/infrastructure/clients-requests.repository';
import { QuizAdminQuestionsRepository } from './quiz/questions/infrastructure/quiz-admin-questions.repository';
import { QuizGameRepository } from './quiz/games/infrastructure/quiz-game.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class AppService {
  constructor(
    private usersRepository: UsersRepository,
    private clientsRequestsRepository: ClientsRequestsRepository,
    private quizQuestionsRepository: QuizAdminQuestionsRepository,
    private quizGameRepository: QuizGameRepository,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async clearDatabase(): Promise<void> {
    await Promise.all([
      await this.quizGameRepository.deleteAllGames(),
      await this.usersRepository.deleteAllUsers(),
      await this.clientsRequestsRepository.deleteAllClientRequests(),
      await this.quizQuestionsRepository.deleteAllQuizQuestions(),
    ]);
  }

  async startTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    return queryRunner;
  }
}
