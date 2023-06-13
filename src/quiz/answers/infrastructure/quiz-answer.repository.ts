import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizAnswerEntity } from '../entities/quiz-answer.entity';
import { Repository } from 'typeorm';
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
  ): Promise<QuizAnswerEntity> {
    const insertResult = await this.typeOrmQuizAnswerRepository
      .createQueryBuilder('answer')
      .insert()
      .into(QuizAnswerEntity)
      .values({ gameId, playerId, questionId, body, status })
      .returning('*')
      .execute();

    return insertResult.generatedMaps[0] as QuizAnswerEntity;
  }
}
