import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { GithubAuthDto } from '../../dto/githubAuth.dto';
import { Inject, UnauthorizedException } from '@nestjs/common';
import authConfig from '@shared/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { Providers } from '@prisma/client';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { UserRepository } from '../../repositories/user.repository';
import { TokensService } from '../../utils/tokens.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import axios from 'axios';
import { Response } from 'express';
import * as crypto from 'crypto';
import { RefreshTokenPayloadType } from '../../types/tokens.models';
import { refreshTokenCookieProp } from '../../variables/refreshToken.variable';

export class GithubAuthCommand implements ICommand {
  constructor(
    public readonly githubCode: GithubAuthDto,
    public readonly res: Response,
  ) {}
}

export type GithubAuthResponseType = {
  userId: number;
  username: string;
  accessToken: string;
};

@CommandHandler(GithubAuthCommand)
export class GithubAuthHandler
  implements ICommandHandler<GithubAuthCommand, GithubAuthResponseType>
{
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly tokensService: TokensService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: GithubAuthCommand): Promise<GithubAuthResponseType> {
    const {
      githubCode: { code: githubCode },
      res,
    } = command;

    const userInfoFromGithub = await this.getUserInfoFromGithub(githubCode);

    const userFromDB = await this.getUserFromDB(
      userInfoFromGithub.userEmail,
      userInfoFromGithub.username,
    );

    await this.createUserSession(userFromDB.id, res);

    return {
      userId: userFromDB.id,
      username: userFromDB.username,
      accessToken: await this.tokensService.createAccessToken(userFromDB.id),
    };
  }

  async getUserInfoFromGithub(githubCode: string): Promise<{
    username: string;
    userEmail: string;
  }> {
    const clientId: string = this.config.GITHUB_CLIENT_ID;
    const clientSecret: string = this.config.GITHUB_CLIENT_SECRET;

    const accessToken: {
      access_token: string;
      token_type: string;
      scope: string;
      error?: string;
      error_description?: string;
      error_uri?: string;
    } = await axios({
      method: 'post',
      url: `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${githubCode}`,
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.data)
      .catch((err) => {
        throw new UnauthorizedException(err);
      });
    if (accessToken.error) {
      throw new UnauthorizedException(accessToken);
    }

    const userEmails: {
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string;
    }[] = await axios({
      method: 'get',
      url: 'https://api.github.com/user/emails',
      headers: { Authorization: `token ${accessToken.access_token}` },
    })
      .then((response) => response.data)
      .catch((err) => {
        throw new UnauthorizedException(err.data);
      });

    const userInfo = await axios({
      method: 'get',
      url: 'https://api.github.com/user',
      headers: { Authorization: `token ${accessToken.access_token}` },
    })
      .then((response) => response.data)
      .catch((err) => {
        throw new UnauthorizedException(err.data);
      });

    return {
      userEmail: userEmails[0].email,
      username: userInfo.name ?? userInfo.login,
    };
  }

  async getUserFromDB(userEmail: string, username: string) {
    let user = await this.userQueryRepository.getUserByEmail(userEmail);

    if (!user) {
      user = await this.userRepository.createUser({
        user: { email: userEmail, username },
        emailInfo: { provider: Providers.Github, emailIsConfirmed: true },
      });

      this.nodemailerService.sendRegistrationSuccessfulMessage(user.email);
    }

    if (user.userEmailInfo.provider !== Providers.Github) {
      await this.userRepository.updateUserEmailInfoByUserId(user.id, {
        provider: Providers.Github,
      });
    }

    return user;
  }

  async createUserSession(userId: number, res: Response): Promise<void> {
    const refreshToken: string = await this.tokensService.createRefreshToken({
      userId,
      uuid: crypto.randomUUID(),
    });

    const refreshTokenPayload: RefreshTokenPayloadType =
      this.tokensService.getTokenPayload(refreshToken);

    // так как в JWT токене время в секундах, то его надо перевести в миллисекунды
    const refreshTokenExpiresAtDate: Date = new Date(
      refreshTokenPayload.exp * 1000,
    );

    await this.userRepository.createUserSession({
      userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
      expiresAt: refreshTokenExpiresAtDate,
    });

    res.cookie(refreshTokenCookieProp, refreshToken, {
      httpOnly: true,
      secure: true,
      expires: refreshTokenExpiresAtDate,
    });
  }
}
