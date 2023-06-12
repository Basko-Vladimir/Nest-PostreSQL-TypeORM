import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { QuizGameEntity } from '../entities/quiz-game.entity';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { QuizGameStatus } from '../../../common/enums';
import { GameQuestionEntity } from '../entities/game-question.entity';
import { GameUserEntity } from '../entities/game-user.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectRepository(QuizGameEntity)
    private typeOrmQuizGameRepository: Repository<QuizGameEntity>,
    @InjectRepository(GameQuestionEntity)
    private typeOrmGameQuestionRepository: Repository<GameQuestionEntity>,
    @InjectRepository(GameUserEntity)
    private typeOrmGameUserRepository: Repository<GameUserEntity>,
  ) {}

  async checkExistingActiveGame(userId: string): Promise<QuizGameEntity> {
    return this.typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .select('game')
      .where(
        new Brackets((qb) => {
          qb.where('game.firstPlayerId = :firstUserId', {
            firstUserId: userId,
          }).orWhere('game.secondPlayerId = :secondUserId', {
            secondUserId: userId,
          });
        }),
      )
      .andWhere('game.status = :activeStatus', {
        activeStatus: QuizGameStatus.ACTIVE,
      })
      .getOne();
  }

  async findStartedGameWithPendingStatus(): Promise<QuizGameEntity> {
    return this.typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .select('game')
      .where('status = :status', {
        status: QuizGameStatus.PENDING_SECOND_PLAYER,
      })
      .getOne();
  }

  async findGameById(gameId: string): Promise<QuizGameEntity> {
    return this.typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .select('game')
      .where('game.id = :gameId', { gameId })
      .getOne();
  }

  async createGame(firstPlayer: UserEntity): Promise<string> {
    const insertResult = await this.typeOrmQuizGameRepository
      .createQueryBuilder()
      .insert()
      .into(QuizGameEntity)
      .values({
        firstPlayerId: firstPlayer.id,
        status: QuizGameStatus.PENDING_SECOND_PLAYER,
      })
      .returning('id')
      .execute();
    const gameId = insertResult.identifiers[0].id;

    await this.createGameUser(gameId, firstPlayer.id);

    return gameId;
  }

  async startGame(gameId: string, secondPlayer: UserEntity): Promise<void> {
    await this.typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .update(QuizGameEntity)
      .set({
        secondPlayerId: secondPlayer.id,
        secondPlayerScore: 0,
        status: QuizGameStatus.ACTIVE,
        startGameDate: new Date(),
      })
      .where('id = :gameId', { gameId })
      .execute();
  }

  async createManyGameQuestions(
    gameId: string,
    questionIds: string[],
  ): Promise<void> {
    await this.typeOrmGameQuestionRepository
      .createQueryBuilder()
      .insert()
      .into(GameQuestionEntity)
      .values(questionIds.map((questionId) => ({ questionId, gameId })))
      .execute();
  }

  async createGameUser(gameId: string, userId: string): Promise<void> {
    await this.typeOrmGameUserRepository
      .createQueryBuilder()
      .insert()
      .into(GameUserEntity)
      .values({ userId, gameId })
      .execute();
  }
}
