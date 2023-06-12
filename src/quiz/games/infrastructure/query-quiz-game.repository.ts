import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizGameEntity } from '../entities/quiz-game.entity';
import { mapQuizGameEntityToQuizGameOutputModel } from '../mappers/quiz-game.mapper';
import { IQuizGameOutputModel } from '../api/dto/quiz-game-output-models.dto';

@Injectable()
export class QueryQuizGameRepository {
  constructor(
    @InjectRepository(QuizGameEntity)
    private typeOrmQuizGameRepository: Repository<QuizGameEntity>,
  ) {}

  async findQuizGameById(gameId: string): Promise<IQuizGameOutputModel> {
    const currentGame = await this.typeOrmQuizGameRepository
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
      ])
      .where('game.id = :gameId', { gameId })
      .getOne();

    return mapQuizGameEntityToQuizGameOutputModel(currentGame);
  }
}
