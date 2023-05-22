import { IComment } from '../comments/entities/interfaces';
import { UserEntity } from '../users/entities/db-entities/user.entity';
import { DeviceSessionEntity } from '../devices-sessions/entities/db-entities/device-session.entity';

declare global {
  declare namespace Express {
    export interface Request {
      context: {
        user?: UserEntity;
        session?: DeviceSessionEntity;
        blog?: IBlog;
        post?: IPost;
        comment?: IComment;
      };
    }
  }
}
