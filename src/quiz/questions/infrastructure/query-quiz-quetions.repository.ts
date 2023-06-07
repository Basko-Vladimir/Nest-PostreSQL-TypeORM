import { Injectable } from '@nestjs/common';
import { IQuizQuestionOutputModel } from '../api/dto/quiz-questions-output-models.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quizQuestionEntity';
import { Repository } from 'typeorm';
import { mapQuizQuestionEntityToQuizQuestionOutputModel } from '../mappers/quiz-questions.mapper';

@Injectable()
export class QueryQuizQuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private typeOrmQuizQuestionsRepository: Repository<QuizQuestionEntity>,
  ) {}

  async findQuizQuestionById(
    questionId: string,
  ): Promise<IQuizQuestionOutputModel> {
    const question = await this.typeOrmQuizQuestionsRepository
      .createQueryBuilder('question')
      .select('question')
      .where('question.id = :questionId', { questionId })
      .getOne();

    return mapQuizQuestionEntityToQuizQuestionOutputModel(question);
  }
}
