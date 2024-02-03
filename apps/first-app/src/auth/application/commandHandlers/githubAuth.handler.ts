import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import authConfig from '../../../../../../shared/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { Providers } from '@prisma/client';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { UserRepository } from '../../repositories/user.repository';
import { TokensService } from '../../utils/tokens.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import axios from 'axios';
import { Response } from 'express';
import { SideAuthCommonFunctions } from './common/sideAuth.commonFunctions';
import { SideAuthResponseType } from '../../dto/response/sideAuth.responseType';

export class GithubAuthCommand {
  constructor(public readonly data: { githubCode: string; res: Response }) {}
}

@CommandHandler(GithubAuthCommand)
export class GithubAuthHandler
  extends SideAuthCommonFunctions
  implements ICommandHandler<GithubAuthCommand, SideAuthResponseType>
{
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly tokensService: TokensService,
    private readonly nodemailerService: NodemailerService,
  ) {
    super({
      userQueryRepository,
      userRepository,
      nodemailerService,
      tokensService,
    });
  }

  async execute(command: GithubAuthCommand): Promise<SideAuthResponseType> {
    const {
      data: { githubCode, res },
    } = command;

    const userInfoFromGithub = await this.getUserInfoFromGithub(githubCode);

    const userFromDB = await this.getUserFromDB({
      userEmail: userInfoFromGithub.userEmail,
      username: userInfoFromGithub.username,
      provider: Providers.Github,
    });

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
}
