import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { GithubAuthDto } from '../../dto/githubAuth.dto';
import { Inject } from '@nestjs/common';
import authConfig from '@shared/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { Providers, User } from '@prisma/client';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { UserRepository } from '../../repositories/user.repository';
import { TokensService } from '../../utils/tokens.service';
import { NodemailerService } from '../../utils/nodemailer.service';

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
    const clientSecret: string = this.config.GOOGLE_CLIENT_SECRET;

    const accessToken: {
      access_token: string;
      token_type: string;
      scope: string;
    } = await fetch(
      `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${githubCode}`,
    ).then((response) => response.json());

    const userEmails: {
      email: string;
      primary: boolean;
      verified: boolean;
      visibility: string;
    }[] = await fetch('https://api.github.com/user/emails', {
      method: 'GET',
      headers: { Authorization: accessToken.access_token },
    }).then((response) => response.json());

    const userInfo = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: { Authorization: accessToken.access_token },
    }).then((response) => response.json());

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
