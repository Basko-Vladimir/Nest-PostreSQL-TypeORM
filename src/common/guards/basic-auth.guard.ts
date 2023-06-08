import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthType } from '../enums';

const BASIC_AUTH_CREDENTIALS_BASE64 = 'YWRtaW46cXdlcnR5';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const [authType, authValue] = authHeader.split(' ');
    const areCorrectAuthCredentials = [
      authType.toLowerCase() === AuthType.BASIC,
      authValue === BASIC_AUTH_CREDENTIALS_BASE64,
    ].every(Boolean);

    if (!areCorrectAuthCredentials) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
