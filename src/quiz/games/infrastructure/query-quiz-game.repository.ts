import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { QuizGameEntity } from '../entities/quiz-game.entity';
import { mapQuizGameEntityToQuizGameOutputModel } from '../mappers/quiz-game.mapper';
import {
  AllMyGamesOutputModel,
  IQuizGameOutputModel,
  IStatisticOutputModel,
} from '../api/dto/quiz-game-output-models.dto';
import {
  QuizGameSortByField,
  QuizGameStatus,
  SortDirection,
} from '../../../common/enums';
import { QuizGamesQueryParamsDto } from '../api/dto/quiz-games-query-params.dto';
import {
  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,
} from '../../../common/constants';
import {
  countSkipValue,
  getCommonInfoForQueryAllRequests,
  getDbSortDirection,
} from '../../../common/utils';

@Injectable()
export class QueryQuizGameRepository {
  constructor(
    @InjectRepository(QuizGameEntity)
    private typeOrmQuizGameRepository: Repository<QuizGameEntity>,
  ) {}

  async getMyStatistic(userId: string): Promise<IStatisticOutputModel> {
    const statisticInfo = await this.typeOrmQuizGameRepository
      .createQueryBuilder('game')
      .select('COUNT(*) as "gamesCountInfo"')
      .where(
        new Brackets((qb) => {
          qb.where('game.firstPlayerId = :firstPlayerId', {
            firstPlayerId: userId,
          }).orWhere('game.secondPlayerId = :secondPlayerId', {
            secondPlayerId: userId,
          });
        }),
      )
      .andWhere('game.status = :finishedStatus', {
        finishedStatus: QuizGameStatus.FINISHED,
      })
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(QuizGameEntity, 'game')
            .where('game.firstPlayerScore = game.secondPlayerScore'),
        'drawsCountInfo',
      )
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(QuizGameEntity, 'game')
            .where('game.firstPlayerScore > game.secondPlayerScore')
            .andWhere('game.firstPlayerId = :firstPlayerId', {
              firstPlayerId: userId,
            }),
        'winsCountAsFirstPlayer',
      )
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(QuizGameEntity, 'game')
            .where('game.firstPlayerScore < game.secondPlayerScore')
            .andWhere('game.secondPlayerId = :secondPlayerId', {
              secondPlayerId: userId,
            }),
        'winsCountAsSecondPlayer',
      )
      .addSelect(
        (qb) =>
          qb
            .select('SUM(game.firstPlayerScore)')
            .from(QuizGameEntity, 'game')
            .where('game.firstPlayerId = :firstPlayerId', {
              firstPlayerId: userId,
            }),
        'sumScoreAsFirstPlayer',
      )
      .addSelect(
        (qb) =>
          qb
            .select('SUM(game.secondPlayerScore)')
            .from(QuizGameEntity, 'game')
            .where('game.secondPlayerId = :secondPlayerId', {
              secondPlayerId: userId,
            }),
        'sumScoreAsSecondPlayer',
      )
      .getRawOne();

    const {
      gamesCountInfo,
      drawsCountInfo,
      sumScoreAsFirstPlayer,
      winsCountAsFirstPlayer,
      sumScoreAsSecondPlayer,
      winsCountAsSecondPlayer,
    } = statisticInfo;
    const gamesCount = Number(gamesCountInfo);
    const drawsCount = Number(drawsCountInfo);
    const sumScore =
      Number(sumScoreAsFirstPlayer) + Number(sumScoreAsSecondPlayer);
    const avgScores = Math.round((sumScore / gamesCount) * 100) / 100;
    const winsCount =
      Number(winsCountAsFirstPlayer) + Number(winsCountAsSecondPlayer);
    const lossesCount = gamesCount - winsCount - drawsCount;

    return {
      sumScore,
      avgScores,
      gamesCount,
      winsCount,
      lossesCount,
      drawsCount,
    };
  }

  async findAllMyGames(
    queryParams: QuizGamesQueryParamsDto,
    userId: string,
  ): Promise<AllMyGamesOutputModel> {
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      pageNumber = DEFAULT_PAGE_NUMBER,
      sortBy = QuizGameSortByField.pairCreatedDate,
      sortDirection = SortDirection.desc,
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const dbSortDirection = getDbSortDirection(sortDirection);
    const filteredSelectQueryBuilder = this.createSelectQueryBuilder()
      .addSelect('question.createdAt')
      .where(
        new Brackets((qb) => {
          qb.where('game.firstPlayerId = :firstPlayerId', {
            firstPlayerId: userId,
          }).orWhere('game.secondPlayerId = :secondPlayerId', {
            secondPlayerId: userId,
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('game.status = :activeStatus', {
            activeStatus: QuizGameStatus.ACTIVE,
          }).orWhere('game.status = :finishedStatus', {
            finishedStatus: QuizGameStatus.FINISHED,
          });
        }),
      );

    const totalCount = await filteredSelectQueryBuilder.getCount();
    const myGames = await filteredSelectQueryBuilder
      .orderBy(`game.${sortBy}`, dbSortDirection)
      .addOrderBy(`game.createdAt`, 'DESC')
      .addOrderBy('answer.createdAt', 'ASC')
      .addOrderBy('question.createdAt', 'ASC')
      // .skip(skip) //TODO: using take and skip with .addOrderBy together some results are cut ;(
      // .take(pageSize)
      .getMany();

    return {
      ...getCommonInfoForQueryAllRequests(totalCount, pageSize, pageNumber),
      items: myGames.map(mapQuizGameEntityToQuizGameOutputModel),
    };
  }

  async findQuizGameById(gameId: string): Promise<IQuizGameOutputModel> {
    const selectQueryBuilder = this.createSelectQueryBuilder();
    const currentGame = await selectQueryBuilder
      .where('game.id = :gameId', { gameId })
      .addOrderBy('answer.createdAt', 'ASC')
      .addOrderBy('question.createdAt', 'ASC')
      .getOne();

    return mapQuizGameEntityToQuizGameOutputModel(currentGame);
  }

  async getCurrentGame(userId: string): Promise<IQuizGameOutputModel> {
    const selectQueryBuilder = this.createSelectQueryBuilder();
    const currentGame = await selectQueryBuilder
      .where(
        new Brackets((qb) => {
          qb.where('game.firstPlayerId = :firstPlayerId', {
            firstPlayerId: userId,
          }).orWhere('game.secondPlayerId = :secondPlayerId', {
            secondPlayerId: userId,
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('game.status = :activeStatus', {
            activeStatus: QuizGameStatus.ACTIVE,
          }).orWhere('game.status = :pendingStatus', {
            pendingStatus: QuizGameStatus.PENDING_SECOND_PLAYER,
          });
        }),
      )
      .addOrderBy('answer.createdAt', 'ASC')
      .addOrderBy('question.createdAt', 'ASC')
      .getOne();

    return currentGame && mapQuizGameEntityToQuizGameOutputModel(currentGame);
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
