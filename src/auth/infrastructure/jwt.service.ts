import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

//TODO investigate need this declaration or not

// declare module "jsonwebtoken" {
//   export interface JwtPayload {
//     userId: string;
//     deviceId?: string;
//   }
// }

@Injectable()
export class JwtService {
  async createJWT(payload: jwt.JwtPayload, expiresIn: string): Promise<string> {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  async getTokenPayload(token: string): Promise<jwt.JwtPayload | null> {
    try {
      const result: jwt.JwtPayload = jwt.verify(token, process.env.JWT_SECRET);
      return result;
    } catch {
      return null;
    }
  }
}
