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

  async findQuestionById(
    questionId: string,
  ): Promise<QuizQuestionEntity | null> {
    return this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .select('question')
      .where('question.id = :questionId', { questionId })
      .getOne();
  }

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

  async updateQuizQuestion(
    questionId: string,
    body: string,
    answers: string,
  ): Promise<void> {
    await this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .update()
      .set({ body, answers })
      .where('question.id = :questionId', { questionId })
      .execute();
  }

  async deleteQuizQuestion(questionId: string): Promise<void> {
    await this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .delete()
      .from(QuizQuestionEntity)
      .where('question.id = :questionId', { questionId })
      .execute();
  }

  async deleteAllQuizQuestions(): Promise<void> {
    await this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .delete()
      .from(QuizQuestionEntity)
      .execute();
  }
}
