import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { GithubAuthDto } from '../../dto/githubAuth.dto';
import { Inject, UnauthorizedException } from '@nestjs/common';
import authConfig from '@shared/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { Providers, User } from '@prisma/client';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { UserRepository } from '../../repositories/user.repository';
import { TokensService } from '../../utils/tokens.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import axios from 'axios';

export class GithubAuthCommand implements ICommand {
  constructor(public readonly githubCode: GithubAuthDto) {}
}

export type GithubUserInfo = {
  userId: number;
  username: string;
  accessToken: string;
};

@CommandHandler(GithubAuthCommand)
export class GithubAuthHandler
  implements ICommandHandler<GithubAuthCommand, GithubUserInfo>
{
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly tokensService: TokensService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: GithubAuthCommand): Promise<GithubUserInfo> {
    const {
      githubCode: { code: githubCode },
    } = command;

    const clientId: string = this.config.GITHUB_CLIENT_ID;
    const clientSecret: string = this.config.GITHUB_CLIENT_SECRET;

    const accessToken: {
      access_token: string;
      token_type: string;
      scope: string;
    } = await axios({
      method: 'post',
      url: `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${githubCode}`,
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.data)
      .catch((err) => {
        throw new UnauthorizedException(err.data);
      });

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

    const username: string = userInfo.name ?? userInfo.login;

    const foundedUser: User | null =
      await this.userQueryRepository.getUserByEmail(userEmails[0].email);

    if (foundedUser) {
      await this.userRepository.updateUserEmailInfoByUserId(foundedUser.id, {
        provider: Providers.Github,
      });

      return {
        userId: foundedUser.id,
        username: foundedUser.username,
        accessToken: await this.tokensService.createAccessToken(foundedUser.id),
      };
    }

    const newUser: User = await this.userRepository.createUser({
      user: { email: userEmails[0].email, username },
      emailInfo: { provider: Providers.Github, emailIsConfirmed: true },
    });

    this.nodemailerService.sendRegistrationSuccessfulMessage(newUser.email);

    return {
      userId: newUser.id,
      username: newUser.username,
      accessToken: await this.tokensService.createAccessToken(foundedUser.id),
    };
  }
}
