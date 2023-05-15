import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../common/enums';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { CreateLikeCommand } from '../../../likes/application/use-cases/create-like.useCase';
import { UpdateLikeCommand } from '../../../likes/application/use-cases/update-like.useCase';

export class UpdatePostLikeStatusCommand {
  constructor(
    public userId: string,
    public postId: string,
    public newStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    private commandBus: CommandBus,
    private likesRepository: LikesRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<void> {
    const { postId, newStatus, userId } = command;
    const existingLike = await this.likesRepository.getLikeByFilter(
      userId,
      postId,
    );

    if (existingLike && existingLike.status === newStatus) return;

    if (existingLike) {
      return this.commandBus.execute(
        new UpdateLikeCommand(existingLike, newStatus),
      );
    } else {
      return this.commandBus.execute(
        new CreateLikeCommand(userId, postId, newStatus),
      );
    }
  }
}
