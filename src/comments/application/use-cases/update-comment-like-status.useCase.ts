import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLikeCommand } from '../../../likes/application/use-cases/update-like.useCase';
import { CreateLikeCommand } from '../../../likes/application/use-cases/create-like.useCase';
import { LikeStatus } from '../../../common/enums';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { CommentEntity } from '../../entities/db-entities/comment.entity';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public userId: string,
    public comment: CommentEntity,
    public newStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(
    private commandBus: CommandBus,
    private likesRepository: LikesRepository,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand): Promise<void> {
    const { newStatus, comment, userId } = command;

    const existingLike = await this.likesRepository.getLikeByFilter(
      userId,
      comment.postId,
      comment.id,
    );

    if (existingLike && existingLike.status === newStatus) return;

    if (existingLike) {
      return this.commandBus.execute(
        new UpdateLikeCommand(existingLike, newStatus),
      );
    } else {
      return this.commandBus.execute(
        new CreateLikeCommand(userId, comment.postId, newStatus, comment.id),
      );
    }
  }
}
