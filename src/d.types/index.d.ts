import { IUser } from '../users/entities/interfaces';
import { IDeviceSession } from '../devices-sessions/entities/interfaces';
import { IComment } from '../comments/entities/interfaces';

declare global {
  declare namespace Express {
    export interface Request {
      context: {
        user?: IUser;
        session?: IDeviceSession;
        blog?: IBlog;
        post?: IPost;
        comment?: IComment;
      };
    }
  }
}
