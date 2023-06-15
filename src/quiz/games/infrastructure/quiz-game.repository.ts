import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryRunner, Repository, SelectQueryBuilder } from 'typeorm';
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
    return this.createSelectQueryBuilder()
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

  async findGameById(
    gameId: string,
    queryRunner?: QueryRunner,
  ): Promise<QuizGameEntity> {
    return (
      this.createSelectQueryBuilder(queryRunner)
        .where('game.id = :gameId', { gameId })
        // .addOrderBy('answer.createdAt', 'DESC')
        .getOne()
    );
  }

  async createGame(
    firstPlayer: UserEntity,
    queryRunner: QueryRunner,
  ): Promise<string> {
    const typeOrmQuizGameRepository =
      queryRunner.manager.getRepository(QuizGameEntity);
    const insertResult = await typeOrmQuizGameRepository
      .createQueryBuilder()
      .setLock('pessimistic_write')
      .insert()
      .into(QuizGameEntity)
      .values({
        firstPlayerId: firstPlayer.id,
        status: QuizGameStatus.PENDING_SECOND_PLAYER,
      })
      .returning('id')
      .execute();
    const gameId = insertResult.identifiers[0].id;

    await this.createGameUser(gameId, firstPlayer.id, queryRunner);

    return gameId;
  }

  async startGame(
    gameId: string,
    secondPlayer: UserEntity,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const typeOrmQuizGameRepository =
      queryRunner.manager.getRepository(QuizGameEntity);

    await typeOrmQuizGameRepository
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
    queryRunner: QueryRunner,
  ): Promise<void> {
    const typeOrmGameQuestionRepository =
      queryRunner.manager.getRepository(GameQuestionEntity);

    await typeOrmGameQuestionRepository
      .createQueryBuilder()
      .insert()
      .into(GameQuestionEntity)
      .values(questionIds.map((questionId) => ({ questionId, gameId })))
      .execute();
  }

  async createGameUser(
    gameId: string,
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const typeOrmGameUserRepository =
      queryRunner.manager.getRepository(GameUserEntity);

    await typeOrmGameUserRepository
      .createQueryBuilder()
      .insert()
      .into(GameUserEntity)
      .values({ userId, gameId })
      .execute();
  }

  async finishGame(
    gameId: string,
    isFirstUser: boolean,
    score: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const updatedField = isFirstUser ? 'firstPlayerScore' : 'secondPlayerScore';
    const typeOrmQuizGameRepository =
      queryRunner.manager.getRepository(QuizGameEntity);

    await typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .update(QuizGameEntity)
      .set({
        status: QuizGameStatus.FINISHED,
        finishGameDate: new Date(),
        [updatedField]: score,
      })
      .where('game.id = :gameId', { gameId })
      .execute();
  }

  async updateScore(
    gameId: string,
    isFirstUser: boolean,
    score: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const updatedField = isFirstUser ? 'firstPlayerScore' : 'secondPlayerScore';
    const typeOrmQuizGameRepository =
      queryRunner.manager.getRepository(QuizGameEntity);

    await typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .update(QuizGameEntity)
      .set({ [updatedField]: score })
      .where('game.id = :gameId', { gameId })
      .execute();
  }

  async deleteAllGames(): Promise<void> {
    await this.typeOrmGameQuestionRepository
      .createQueryBuilder('gameQuestion')
      .delete()
      .from(GameQuestionEntity)
      .execute();
    await this.typeOrmGameUserRepository
      .createQueryBuilder('gameUser')
      .delete()
      .from(GameUserEntity)
      .execute();
    await this.typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .delete()
      .from(QuizGameEntity)
      .execute();
  }

  private createSelectQueryBuilder(
    queryRunner?: QueryRunner,
  ): SelectQueryBuilder<QuizGameEntity> {
    const currentRepository = queryRunner
      ? queryRunner.manager.getRepository(QuizGameEntity)
      : this.typeOrmQuizGameRepository;

    return currentRepository
      .createQueryBuilder('game')
      .leftJoin('game.questions', 'question')
      .leftJoin('game.users', 'user')
      .leftJoin('game.answers', 'answer')
      .select([
        'game',
        'question.id',
        'question.body',
        'question.correctAnswers',
        'user.id',
        'user.login',
        'answer',
      ]);
  }
}
