import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../../common/enums';
import { LikesRepository } from '../../infrastructure/likes.repository';

export class CreateLikeCommand {
  constructor(
    public userId: string,
    public postId: string,
    public status: LikeStatus = LikeStatus.NONE,
    public commentId: string = null,
  ) {}
}

@CommandHandler(CreateLikeCommand)
export class CreateLikeUseCase implements ICommandHandler<CreateLikeCommand> {
  constructor(private likesRepository: LikesRepository) {}

  async execute(command: CreateLikeCommand): Promise<void> {
    const { userId, postId, status, commentId } = command;

    return this.likesRepository.createLike(userId, postId, status, commentId);
  }
}
