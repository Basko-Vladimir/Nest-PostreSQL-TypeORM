import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BearerAuthGuard } from '../../../common/guards/bearer-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectToGameCommand } from '../application/use-cases/connect-to-game.useCase';
import { User } from '../../../common/decorators/user.decorator';
import { UserEntity } from '../../../users/entities/db-entities/user.entity';
import { QueryQuizGameRepository } from '../infrastructure/query-quiz-game.repository';
import { IQuizGameOutputModel } from './dto/quiz-game-output-models.dto';
import { QuizGame } from '../../../common/decorators/game.decorator';
import { QuizGameEntity } from '../entities/quiz-game.entity';
import { DoubleParticipateToGameGuard } from '../../../common/guards/double-participate-to-game.guard';
import { CheckExistingEntityGuard } from '../../../common/guards/check-existing-entity.guard';
import { ParamIdType } from '../../../common/decorators/param-id-type.decorator';
import { IdTypes } from '../../../common/enums';
import { IAnswerOutputModel } from '../../answers/api/dto/answer-output-models.dto';
import { CheckParticipationInGameGuard } from '../../../common/guards/check-participation-in-game.guard';
import { CreateAnswerDto } from '../../answers/api/dto/create-answer.dto';
import { GiveAnswerCommand } from '../../answers/application/use-cases/give-answer.useCase';

@Controller('pair-game-quiz/pairs')
@UseGuards(BearerAuthGuard)
export class GameController {
  constructor(
    private commandBus: CommandBus,
    private queryQuizGameRepository: QueryQuizGameRepository,
  ) {}

  @Get('my-current')
  async getCurrentGame(
    @User('id') userId: string,
  ): Promise<IQuizGameOutputModel> {
    const currentGame = await this.queryQuizGameRepository.getCurrentGame(
      userId,
    );

    if (!currentGame) throw new NotFoundException();

    return currentGame;
  }

  @Get(':id')
  @ParamIdType([IdTypes.QUIZ_GAME_ID])
  @UseGuards(CheckExistingEntityGuard)
  async findGameById(
    @User('id') userId: string,
    @QuizGame() game: QuizGameEntity,
  ): Promise<IQuizGameOutputModel> {
    if (userId !== game.firstPlayerId && userId !== game.secondPlayerId) {
      throw new ForbiddenException();
    }

    return this.queryQuizGameRepository.findQuizGameById(game.id);
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  @UseGuards(DoubleParticipateToGameGuard)
  async connectToGame(
    @User() user: UserEntity,
    @QuizGame() game: QuizGameEntity,
  ): Promise<IQuizGameOutputModel> {
    const actualGameId = await this.commandBus.execute(
      new ConnectToGameCommand(user, game),
    );

    return this.queryQuizGameRepository.findQuizGameById(actualGameId);
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CheckParticipationInGameGuard)
  async giveAnswer(
    @Body() createAnswerDto: CreateAnswerDto,
    @User('id') userId: string,
    @QuizGame() game: QuizGameEntity,
  ): Promise<IAnswerOutputModel> {
    return this.commandBus.execute(
      new GiveAnswerCommand(userId, game, createAnswerDto.answer),
    );
  }
}
