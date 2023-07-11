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
  PlayerResult,
  QuizGameSortByField,
  QuizGameStatus,
  SortDirection,
  StatisticSortByField,
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
import { QuizUsersTopParamsDto } from '../api/dto/quiz-users-top-params.dto';
import { GameUserEntity } from '../entities/game-user.entity';
import {
  IRawStatisticData,
  mapCommonRawStatisticToStatisticOutputModel,
  mapCurrentRawStatisticToStatisticOutputModel,
} from '../mappers/game-statistic.mapper';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';

@Injectable()
export class QueryQuizGameRepository {
  constructor(
    @InjectRepository(QuizGameEntity)
    private typeOrmQuizGameRepository: Repository<QuizGameEntity>,
    @InjectRepository(GameUserEntity)
    private typeOrmGameUserRepository: Repository<GameUserEntity>,
  ) {}

  async getUsersTop(queryParams: QuizUsersTopParamsDto): Promise<any> {
    const {
      pageNumber = 1,
      pageSize = 10,
      sort = [
        `${StatisticSortByField.AVG_SCORES} ${SortDirection.desc}`,
        `${StatisticSortByField.SUM_SCORE} ${SortDirection.desc}`,
      ],
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const selectQueryBuilder = this.typeOrmGameUserRepository
      .createQueryBuilder('gameUser')
      .innerJoin(QuizGameEntity, 'game', 'game.id = gameUser.gameId')
      .where('game.status = :finishedStatus', {
        finishedStatus: QuizGameStatus.FINISHED,
      });
    let statisticItems;

    const totalCountInfo = await selectQueryBuilder
      .select('COUNT(DISTINCT "gameUser"."userId") as "usersCount"')
      .getRawOne();
    const statisticItemsQueryBuilder = selectQueryBuilder
      .select([
        'COUNT(gameUser.id) as "gamesCount"',
        'SUM(gameUser.score) as "sumScore"',
        'AVG(gameUser.score) as "avgScores"',
        `COUNT(
          CASE
            WHEN gameUser.playerResult = '${PlayerResult.WINNER}' THEN true
            ELSE NULL
          END
        ) as "winsCount"`,
        `COUNT(
          CASE
            WHEN gameUser.playerResult = '${PlayerResult.LOSER}' THEN true
            ELSE NULL
          END
        ) as "lossesCount"`,
        `COUNT(
          CASE
            WHEN gameUser.playerResult = '${PlayerResult.DRAW}' THEN true
            ELSE NULL
          END
        ) as "drawsCount"`,
        'gameUser.userId as "playerId"',
      ])
      .addSelect(
        (qb) =>
          qb
            .select('login')
            .from(UserEntity, 'u')
            .where('u.id = gameUser.userId'),
        'login',
      )
      .groupBy('gameUser.userId')
      .limit(pageSize)
      .offset(skip);

    if (typeof sort === 'string') {
      const sortBy = sort.split(' ')[0];
      const direction = sort.split(' ')[1];
      const sortDirection = getDbSortDirection(direction);
      statisticItems = await statisticItemsQueryBuilder
        .addOrderBy(`"${sortBy}"`, sortDirection)
        .getRawMany();
    } else if (Array.isArray(sort)) {
      let orderedStatisticItems;

      sort.forEach((item) => {
        const sortBy = item.split(' ')[0];
        const direction = item.split(' ')[1];
        const sortDirection = getDbSortDirection(direction);

        orderedStatisticItems = statisticItemsQueryBuilder.addOrderBy(
          `"${sortBy}"`,
          sortDirection,
        );
      });

      statisticItems = await orderedStatisticItems.getRawMany();
    }

    console.log(statisticItems);

    return {
      ...getCommonInfoForQueryAllRequests(
        totalCountInfo.usersCount,
        pageSize,
        pageNumber,
      ),
      items: statisticItems?.map(mapCommonRawStatisticToStatisticOutputModel),
    };
  }

  async getMyStatistic(userId: string): Promise<IStatisticOutputModel> {
    const statisticInfo: IRawStatisticData =
      await this.typeOrmQuizGameRepository
        .createQueryBuilder('game')
        .select('COUNT(*) as "gamesCount"')
        .where(
          `EXISTS (
            SELECT 1
            FROM "game" g
              LEFT JOIN "gameUser" ON "g"."id" = "gameUser"."gameId"
            WHERE "gameUser"."userId" = :userId
              AND "gameUser"."gameId" = game.id
          )`,
          { userId },
        )
        .andWhere('game.status = :finishedStatus', {
          finishedStatus: QuizGameStatus.FINISHED,
        })
        .addSelect(
          (qb) =>
            qb
              .select('SUM(score)')
              .from(GameUserEntity, 'gameUser')
              .where('gameUser.userId = :userId', { userId }),
          'sumScore',
        )
        .addSelect(
          (qb) =>
            qb
              .select('AVG(score)')
              .from(GameUserEntity, 'gameUser')
              .where('gameUser.userId = :userId', { userId }),
          'avgScores',
        )
        .addSelect(
          (qb) =>
            qb
              .select('COUNT(*)')
              .from(GameUserEntity, 'gameUser')
              .where('gameUser.userId = :userId', { userId })
              .andWhere('gameUser.playerResult = :result', {
                result: PlayerResult.WINNER,
              }),
          'winsCount',
        )
        .addSelect(
          (qb) =>
            qb
              .select('COUNT(*)')
              .from(GameUserEntity, 'gameUser')
              .where('gameUser.userId = :userId', { userId })
              .andWhere('gameUser.playerResult = :result', {
                result: PlayerResult.LOSER,
              }),
          'lossesCount',
        )
        .getRawOne();

    return mapCurrentRawStatisticToStatisticOutputModel(statisticInfo);
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
        `EXISTS (
          SELECT 1
          FROM "game" g
            LEFT JOIN "gameUser" ON "g"."id" = "gameUser"."gameId"
          WHERE "gameUser"."userId" = :userId
            AND "gameUser"."gameId" = game.id
        )`,
        { userId },
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

  async getCurrentGame(userId: string): Promise<any> {
    const currentGame = await this.createSelectQueryBuilder()
      .where(
        `EXISTS (
          SELECT 1
          FROM "game" g
            LEFT JOIN "gameUser" ON "g"."id" = "gameUser"."gameId"
          WHERE "gameUser"."userId" = :userId
            AND "gameUser"."gameId" = game.id
        )`,
        { userId },
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
      .leftJoin('game.answers', 'answer')
      .leftJoin('game.gameUsers', 'gameUser')
      .leftJoin('gameUser.user', 'user')
      .select([
        'game',
        'question.id',
        'question.body',
        'user.id',
        'user.login',
        'answer',
        'gameUser',
      ]);
  }
}
