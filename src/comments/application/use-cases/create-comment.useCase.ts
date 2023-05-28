import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { mapDbCommentToCommentOutputModel } from '../../mappers/comments-mapper';
import { ICommentOutputModel } from '../../api/dto/comments-output-models.dto';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const { userId, postId, content } = command;
    return this.commentsRepository.createComment(userId, postId, content);
  }
}
