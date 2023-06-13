import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { validate } from 'class-validator';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { IdTypes } from '../enums';
import { generateCustomBadRequestException } from '../utils';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { IdValidator } from '../validators/uuid.validator';
import { CommentsRepository } from '../../comments/infrastructure/comments.repository';
import { QuizAdminQuestionsRepository } from '../../quiz/questions/infrastructure/quiz-admin-questions.repository';
import { QuizGameRepository } from '../../quiz/games/infrastructure/quiz-game.repository';

@Injectable()
export class CheckExistingEntityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersRepository: UsersRepository,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
    private quizQuestionsRepository: QuizAdminQuestionsRepository,
    private quizGameRepository: QuizGameRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const paramIds = request.params;
    const idTypes = this.reflector.get('idTypes', context.getHandler());

    for (let i = 0; i < idTypes.length; i++) {
      const currentId = paramIds[idTypes[i]] || paramIds.id;
      const validationErrors = await validate(new IdValidator(currentId));

      if (validationErrors.length) {
        generateCustomBadRequestException('Invalid Id', idTypes[i]);
      }

      switch (idTypes[i]) {
        case IdTypes.BLOG_ID: {
          const blog = await this.blogsRepository.findBlogById(currentId);
          CheckExistingEntityGuard.checkEntity(blog);
          request.context = { ...request.context, blog };
          break;
        }
        case IdTypes.POST_ID: {
          const post = await this.postsRepository.findPostById(currentId);
          CheckExistingEntityGuard.checkEntity(post);
          request.context = { ...request.context, post };
          break;
        }
        case IdTypes.COMMENT_ID: {
          const comment = await this.commentsRepository.findCommentById(
            currentId,
          );
          CheckExistingEntityGuard.checkEntity(comment);
          request.context = { ...request.context, comment };
          break;
        }
        case IdTypes.USER_ID: {
          const user = await this.usersRepository.findUserById(currentId);
          CheckExistingEntityGuard.checkEntity(user);
          break;
        }
        case IdTypes.QUIZ_QUESTION_ID: {
          const question = await this.quizQuestionsRepository.findQuestionById(
            currentId,
          );
          CheckExistingEntityGuard.checkEntity(question);
          break;
        }
        case IdTypes.QUIZ_GAME_ID: {
          const game = await this.quizGameRepository.findGameById(currentId);
          CheckExistingEntityGuard.checkEntity(game);
          request.context = { ...request.context, game };
          break;
        }
      }
    }

    return true;
  }

  static checkEntity(entity: unknown): void {
    if (!entity) {
      throw new NotFoundException();
    }
  }
}
