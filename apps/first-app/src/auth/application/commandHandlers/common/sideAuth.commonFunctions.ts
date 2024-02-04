import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { UserRepository } from '../../../repositories/user.repository';
import { TokensService } from '../../../utils/tokens.service';
import { NodemailerService } from '../../../utils/nodemailer.service';
import { Response } from 'express';
import { RefreshTokenPayloadType } from '../../../types/tokens.models';
import { Providers } from '@prisma/client';
import * as crypto from 'crypto';
import { getRefreshTokenCookieConfig } from '../../../variables/refreshToken.config';

export class SideAuthCommonFunctions {
  constructor(
    protected readonly dependencies: {
      userQueryRepository: UserQueryRepository;
      userRepository: UserRepository;
      tokensService: TokensService;
      nodemailerService: NodemailerService;
    },
  ) {}

  async getUserFromDB(data: {
    username: string;
    userEmail: string;
    provider: Providers;
  }) {
    const { username, userEmail, provider } = data;

    let user =
      await this.dependencies.userQueryRepository.getUserByEmail(userEmail);

    if (!user) {
      user = await this.dependencies.userRepository.createUser({
        user: { email: userEmail, username },
        emailInfo: { provider, emailIsConfirmed: true },
      });

      await this.dependencies.nodemailerService.sendRegistrationSuccessfulMessage(
        user.email,
      );
    }

    if (user.userEmailInfo.provider !== provider) {
      await this.dependencies.userRepository.updateEmailInfoByUserId(user.id, {
        provider,
        emailIsConfirmed: true,
      });
    }

    return user;
  }

  async createUserSession(userId: number, res: Response): Promise<void> {
    const refreshToken: string =
      await this.dependencies.tokensService.createRefreshToken({
        userId,
        uuid: crypto.randomUUID(),
      });

    const refreshTokenPayload: RefreshTokenPayloadType =
      this.dependencies.tokensService.getTokenPayload(refreshToken);

    // так как в JWT токене время в секундах, то его надо перевести в миллисекунды
    const refreshTokenExpiresAtDate: Date = new Date(
      refreshTokenPayload.exp * 1000,
    );

    await this.dependencies.userRepository.createSession({
      userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
      expiresAt: refreshTokenExpiresAtDate,
    });

    const refreshTokenCookieConfig = getRefreshTokenCookieConfig(
      refreshTokenExpiresAtDate,
    );

    res.cookie(
      refreshTokenCookieConfig.cookieTitle,
      refreshToken,
      refreshTokenCookieConfig.cookieOptions,
    );
  }
}
