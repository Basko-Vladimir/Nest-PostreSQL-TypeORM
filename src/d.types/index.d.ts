import { IDeviceSession } from '../devices-sessions/entities/interfaces';
import { IComment } from '../comments/entities/interfaces';
import { User } from '../users/entities/db-entities/user.entity';

declare global {
  declare namespace Express {
    export interface Request {
      context: {
        user?: User;
        session?: IDeviceSession;
        blog?: IBlog;
        post?: IPost;
        comment?: IComment;
      };
    }
  }
}
