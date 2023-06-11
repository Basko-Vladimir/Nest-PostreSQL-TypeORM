import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestionEntity } from '../entities/quiz-question.entity';
import { QUESTIONS_AMOUNT_IN_ONE_GAME } from '../../../common/constants';

@Injectable()
export class QuizQuestionsRepository {
  constructor(
    @InjectRepository(QuizQuestionEntity)
    private typeOrmQuizQuestionRepository: Repository<QuizQuestionEntity>,
  ) {}

  async findRandomQuestions(): Promise<QuizQuestionEntity[]> {
    return this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .select('question')
      .where('question.isPublished = true')
      .orderBy('Random()')
      .limit(QUESTIONS_AMOUNT_IN_ONE_GAME)
      .getMany();
  }

  async findQuestionById(
    questionId: string,
  ): Promise<QuizQuestionEntity | null> {
    return this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .select('question')
      .where('question.id = :questionId', { questionId })
      .getOne();
  }

  async createQuizQuestion(
    body: string,
    correctAnswers: string,
  ): Promise<string> {
    const createdQuestionData = await this.typeOrmQuizQuestionRepository
      .createQueryBuilder()
      .insert()
      .into(QuizQuestionEntity)
      .values({ body, correctAnswers })
      .returning('id')
      .execute();

    return createdQuestionData.identifiers[0].id;
  }

  async updateQuizQuestion(
    questionId: string,
    body: string,
    correctAnswers: string,
  ): Promise<void> {
    await this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .update()
      .set({ body, correctAnswers, updatedAt: new Date() })
      .where('question.id = :questionId', { questionId })
      .execute();
  }

  async updateQuizQuestionPublishStatus(
    questionId: string,
    isPublished: boolean,
  ): Promise<void> {
    await this.typeOrmQuizQuestionRepository
      .createQueryBuilder('question')
      .update()
      .set({ isPublished, updatedAt: new Date() })
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
