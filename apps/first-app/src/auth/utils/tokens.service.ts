import { ConfigService, ConfigType } from '@nestjs/config';
import appConfig from '../../../../../libs/config/src/config.service';
import { Inject, Injectable } from '@nestjs/common';
import { add, getUnixTime } from 'date-fns';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayloadType,
  RefreshTokenPayloadType,
} from '../dto/tokens.dto';

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

  async createRefreshToken(userId: number): Promise<string> {
    const currentDate: Date = new Date();

    const payload: RefreshTokenPayloadType = {
      userId,
      iat: getUnixTime(currentDate),
      exp: this.getRefreshTokenExpiredTime(currentDate),
    };

    return this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
    });
  }

  async createTokensPair(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokensPair: string[] = await Promise.all([
      this.createAccessToken(userId),
      this.createRefreshToken(userId),
    ]);

    return {
      accessToken: tokensPair[0],
      refreshToken: tokensPair[1],
    };
  }
}
