import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { IdTypes } from '../enums';

@ValidatorConstraint({ name: 'IsExistEntity', async: true })
@Injectable()
export class IsExistEntityValidator implements ValidatorConstraintInterface {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async validate(id: IdTypes, args: ValidationArguments): Promise<boolean> {
    let result;

    try {
      switch (args.property) {
        case IdTypes.BLOG_ID: {
          result = await this.blogsRepository.findBlogById(id);
          break;
        }
        case IdTypes.POST_ID: {
          result = await this.postsRepository.findPostById(id);
          break;
        }
      }

      return Boolean(result);
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Entity with such "${args.property}" doesn't exist!`;
  }
}

export function IsExistEntity(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExistEntityValidator,
    });
  };
}
