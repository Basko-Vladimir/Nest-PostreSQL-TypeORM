import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { QuizGameEntity } from '../entities/quiz-game.entity';
import { mapQuizGameEntityToQuizGameOutputModel } from '../mappers/quiz-game.mapper';
import { IQuizGameOutputModel } from '../api/dto/quiz-game-output-models.dto';
import { QuizGameStatus } from '../../../common/enums';

@Injectable()
export class QueryQuizGameRepository {
  constructor(
    @InjectRepository(QuizGameEntity)
    private typeOrmQuizGameRepository: Repository<QuizGameEntity>,
  ) {}

  async findQuizGameById(gameId: string): Promise<IQuizGameOutputModel> {
    const selectQueryBuilder = this.createSelectQueryBuilder();
    const currentGame = await selectQueryBuilder
      .where('game.id = :gameId', { gameId })
      .getOne();

    return mapQuizGameEntityToQuizGameOutputModel(currentGame);
  }

  async getCurrentGame(userId: string): Promise<IQuizGameOutputModel> {
    const selectQueryBuilder = this.createSelectQueryBuilder();
    const currentGame = await selectQueryBuilder
      .where('game.firstPlayerId = :userId OR game.secondPlayerId = :userId', {
        userId,
      })
      .andWhere('game.status = :activeStatus OR game.status = :pendingStatus', {
        activeStatus: QuizGameStatus.ACTIVE,
        pendingStatus: QuizGameStatus.PENDING_SECOND_PLAYER,
      })
      .getOne();

    return mapQuizGameEntityToQuizGameOutputModel(currentGame);
  }

  private createSelectQueryBuilder(): SelectQueryBuilder<QuizGameEntity> {
    return this.typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .leftJoin('game.questions', 'question')
      .leftJoin('game.users', 'user')
      .leftJoin('game.answers', 'answer')
      .select([
        'game',
        'question.id',
        'question.body',
        'user.id',
        'user.login',
        'answer',
      ]);
  }
}
