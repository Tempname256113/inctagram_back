import { ConfigService, ConfigType } from '@nestjs/config';
import appConfig from '@shared/config/app.config.service';
import { Inject, Injectable } from '@nestjs/common';
import { add, getUnixTime } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
} from '../types/tokens.models';
import * as crypto from 'crypto';

@Injectable()
export class TokensService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  private readonly getAccessTokenExpiredTime: (currentDate: Date) => number;
  private readonly getRefreshTokenExpiredTime: (currentDate: Date) => number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(appConfig.KEY)
    private readonly config: ConfigType<typeof appConfig>,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecret = this.config.ACCESS_TOKEN_SECRET;
    this.refreshTokenSecret = this.config.REFRESH_TOKEN_SECRET;

    this.getAccessTokenExpiredTime = (currentDate: Date) => {
      return getUnixTime(add(currentDate, { minutes: 15 }));
    };
    this.getRefreshTokenExpiredTime = (currentDate: Date) => {
      return getUnixTime(add(currentDate, { months: 3 }));
    };
  }

  async createAccessToken(userId: number): Promise<string> {
    const currentDate: Date = new Date();

    const payload: AccessTokenPayloadType = {
      userId,
      iat: getUnixTime(currentDate),
      exp: this.getAccessTokenExpiredTime(currentDate),
    };

    return this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
    });
  }

  async createRefreshToken(data: {
    userId: number;
    uuid: string;
  }): Promise<string> {
    const { userId, uuid } = data;

    const currentDate: Date = new Date();

    const payload: RefreshTokenPayloadType = {
      userId,
      uuid,
      iat: getUnixTime(currentDate),
      exp: this.getRefreshTokenExpiredTime(currentDate),
    };

    return this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
    });
  }

  async createTokensPair(data: {
    userId: number;
    uuid?: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, uuid = crypto.randomUUID() } = data;

    const [accessToken, refreshToken]: string[] = await Promise.all([
      this.createAccessToken(userId),
      this.createRefreshToken({ userId, uuid }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  getTokenPayload(token: string): RefreshTokenPayloadType {
    return this.jwtService.decode(token);
  }

  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayloadType | null> {
    try {
      const refreshTokenPayload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.refreshTokenSecret,
          ignoreExpiration: false,
        },
      );

      return refreshTokenPayload;
    } catch (err) {
      return null;
    }
  }
}
