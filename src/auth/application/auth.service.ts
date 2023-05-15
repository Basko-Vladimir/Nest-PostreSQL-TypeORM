import { CookieOptions } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { JwtService } from '../infrastructure/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected jwtService: JwtService,
  ) {}

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<string | null> {
    const user = await this.usersRepository.findUserByLoginOrEmail({
      login: loginOrEmail,
      email: loginOrEmail,
    });

    if (!user || user.isBanned) {
      throw new UnauthorizedException();
    }

    const isMatchedUser = await bcrypt.compare(password, user.passwordHash);

    if (!isMatchedUser) throw new UnauthorizedException();

    return String(user.id);
  }

  async createNewTokensPair(
    accessTokenPayload: JwtPayload,
    accessTokenLifetime: string,
    refreshTokenPayload: JwtPayload,
    refreshTokenLifetime: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.createJWT(
      { ...accessTokenPayload },
      accessTokenLifetime,
    );
    const refreshToken = await this.jwtService.createJWT(
      { ...refreshTokenPayload },
      refreshTokenLifetime,
    );

    return { accessToken, refreshToken };
  }

  static async generatePasswordHash(password: string): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, passwordSalt);
  }

  static setCookieSettings(tokenPayload: jwt.JwtPayload): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      expires: new Date(tokenPayload.exp),
    };
  }
}
