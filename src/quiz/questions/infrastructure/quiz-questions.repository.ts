import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quizQuestionEntity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizQuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private typeOrmQuizQuestionRepository: Repository<QuizQuestionEntity>,
  ) {}

  async createQuizQuestion(body: string, answers: string): Promise<string> {
    const createdQuestionData = await this.typeOrmQuizQuestionRepository
      .createQueryBuilder()
      .insert()
      .into(QuizQuestionEntity)
      .values({ body, answers })
      .returning('id')
      .execute();

    return createdQuestionData.identifiers[0].id;
  }

  async deleteAllQuizQuestions(): Promise<void> {
    await this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .delete()
      .from(QuizQuestionEntity)
      .execute();
  }
}
