import { UserEntity } from '../users/entities/db-entities/user.entity';
import { DeviceSessionEntity } from '../devices-sessions/entities/db-entities/device-session.entity';
import { PostEntity } from '../posts/entities/db-entities/post.entity';
import { BlogEntity } from '../blogs/entities/db-entities/blog.entity';
import { CommentEntity } from '../comments/entities/db-entities/comment.entity';

declare global {
  declare namespace Express {
    export interface Request {
      context: {
        user?: UserEntity;
        session?: DeviceSessionEntity;
        blog?: BlogEntity;
        post?: PostEntity;
        comment?: CommentEntity;
      };
    }
  }
}
