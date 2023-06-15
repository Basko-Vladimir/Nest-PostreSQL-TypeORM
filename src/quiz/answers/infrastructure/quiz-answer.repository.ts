import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizAnswerEntity } from '../entities/quiz-answer.entity';
import { QueryRunner, Repository } from 'typeorm';
import { AnswerStatus } from '../../../common/enums';

@Injectable()
export class QuizAnswerRepository {
  constructor(
    @InjectRepository(QuizAnswerEntity)
    private typeOrmQuizAnswerRepository: Repository<QuizAnswerEntity>,
  ) {}

  async createAnswer(
    gameId: string,
    playerId: string,
    questionId: string,
    body: string,
    status: AnswerStatus,
    queryRunner: QueryRunner,
  ): Promise<QuizAnswerEntity> {
    const typeOrmQuizAnswerRepository =
      queryRunner.manager.getRepository(QuizAnswerEntity);

    const insertResult = await typeOrmQuizAnswerRepository
      .createQueryBuilder('answer')
      .setLock('pessimistic_write')
      .insert()
      .into(QuizAnswerEntity)
      .values({ gameId, playerId, questionId, body, status })
      .returning('*')
      .execute();

    return insertResult.generatedMaps[0] as QuizAnswerEntity;
  }
}
