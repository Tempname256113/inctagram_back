import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { SideAuthResponseType } from '../../dto/response/sideAuth.responseType';
import { Inject, UnauthorizedException } from '@nestjs/common';
import authConfig from '@shared/config/auth.config.service';
import { ConfigType } from '@nestjs/config';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { UserRepository } from '../../repositories/user.repository';
import { TokensService } from '../../utils/tokens.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import { Response as Res } from 'express';
import axios from 'axios';
import { Providers } from '@prisma/client';
import { SideAuthCommonFunctions } from './common/sideAuth.commonFunctions';

export class GoogleAuthCommand implements ICommand {
  constructor(public readonly data: { googleCode: string; res: Res }) {}
}

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler
  extends SideAuthCommonFunctions
  implements ICommandHandler<GoogleAuthCommand, SideAuthResponseType>
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
      tokensService,
      nodemailerService,
    });
  }

  async execute(command: GoogleAuthCommand): Promise<SideAuthResponseType> {
    const {
      data: { googleCode, res },
    } = command;

    const userInfoFromGoogle = await this.getUserInfoFromGoogle(googleCode);

    const userFromDB = await this.getUserFromDB({
      username: userInfoFromGoogle.username,
      userEmail: userInfoFromGoogle.userEmail,
      provider: Providers.Google,
    });

    await this.createUserSession(userFromDB.id, res);

    return {
      userId: userFromDB.id,
      username: userFromDB.username,
      accessToken: await this.tokensService.createAccessToken(userFromDB.id),
    };
  }

  async getUserInfoFromGoogle(
    googleCode: string,
  ): Promise<{ username: string; userEmail: string }> {
    const clientId: string = this.config.GOOGLE_CLIENT_ID;
    const clientSecret: string = this.config.GOOGLE_CLIENT_SECRET;
    const frontendUrl: string = this.config.FRONTEND_URL;

    const accessToken: {
      access_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      id_token: string;
    } = await axios({
      method: 'post',
      url: `https://oauth2.googleapis.com/token?grant_type=authorization_code&code=${googleCode}&redirect_uri=${frontendUrl}&client_id=${clientId}&client_secret=${clientSecret}`,
      headers: { Accept: 'application/json' },
    })
      .then((res) => res.data)
      .catch((err) => {
        throw new UnauthorizedException({
          message: 'google response',
          ...err.response.data,
        });
      });

    const userInfo: {
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      locale: string;
    } = await axios({
      method: 'get',
      url: `https://www.googleapis.com/userinfo/v2/me`,
      headers: { Authorization: `Bearer ${accessToken.access_token}` },
    })
      .then((res) => res.data)
      .catch((err) => {
        throw new UnauthorizedException(err.response.data);
      });

    return {
      userEmail: userInfo.email,
      username: userInfo.name ?? userInfo.given_name,
    };
  }
}
