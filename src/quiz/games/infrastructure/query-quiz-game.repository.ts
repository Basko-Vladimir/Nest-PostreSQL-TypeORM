import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { QuizGameEntity } from '../entities/quiz-game.entity';
import { mapQuizGameEntityToQuizGameOutputModel } from '../mappers/quiz-game.mapper';
import {
  AllMyGamesOutputModel,
  IQuizGameOutputModel,
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
      // .orderBy(`game.${sortBy}`, dbSortDirection)
      // .addOrderBy('answer.createdAt', 'ASC')
      // .addOrderBy('question.createdAt', 'ASC')
      .take(pageSize)
      .skip(skip)
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
