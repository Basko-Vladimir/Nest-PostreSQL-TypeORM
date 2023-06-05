import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../common/enums';
import { LikesRepository } from '../../infrastructure/likes.repository';
import { LikeEntity } from '../../entities/db-entities/like.entity';

export class UpdateLikeCommand {
  constructor(public like: LikeEntity, public status: LikeStatus) {}
}

@CommandHandler(UpdateLikeCommand)
export class UpdateLikeUseCase implements ICommandHandler<UpdateLikeCommand> {
  constructor(private likesRepository: LikesRepository) {}

  async execute(command: UpdateLikeCommand): Promise<void> {
    const { like, status } = command;

    return this.likesRepository.updateLike(
      like.userId,
      like.postId,
      status,
      like.commentId,
    );
  }
}
