import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginDTO } from '../../dto/login.dto';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { BcryptService } from '../../utils/bcrypt.service';
import { USER_ERRORS } from '../../variables/validationErrors.messages';
import { Response } from 'express';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { TokensService } from '../../utils/tokens.service';
import { RefreshTokenPayloadType } from '../../types/tokens.models';
import * as crypto from 'crypto';
import { UserRepository } from '../../repositories/user.repository';
import { getRefreshTokenCookieConfig } from '../../variables/refreshToken.config';

export class LoginCommand {
  constructor(
    public readonly data: { userLoginDTO: LoginDTO; res: Response },
  ) {}
}

// возвращает id юзера если логин прошел успешно
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bcryptService: BcryptService,
    private readonly tokensService: TokensService,
  ) {}

  async execute(command: LoginCommand): Promise<void> {
    const {
      data: { userLoginDTO, res },
    } = command;

    const user = await this.getUser(userLoginDTO);

    await this.createSession({ userId: user.id, res });

    const accessToken: string = await this.tokensService.createAccessToken(
      user.id,
    );

    res.status(HttpStatus.OK).send({ accessToken });
  }

  async getUser(userLoginDTO: LoginDTO) {
    const foundUser = await this.userQueryRepository.getUserByEmail(
      userLoginDTO.email,
    );

    if (!foundUser) {
      throw new UnauthorizedException(USER_ERRORS.EMAIL_OR_PASSWORD_INCORRECT);
    }

    const passwordIsCorrect: boolean =
      await this.bcryptService.compareHashAndPassword({
        password: userLoginDTO.password,
        hash: foundUser.password,
      });

    if (!passwordIsCorrect) {
      throw new UnauthorizedException(USER_ERRORS.EMAIL_OR_PASSWORD_INCORRECT);
    }

    return foundUser;
  }

  async createSession(data: { userId: number; res: Response }) {
    const { userId, res } = data;

    const refreshToken: string = await this.tokensService.createRefreshToken({
      userId,
      uuid: crypto.randomUUID(),
    });

    const refreshTokenPayload: RefreshTokenPayloadType =
      this.tokensService.getTokenPayload(refreshToken);

    const refreshTokenExpiresAtDate: Date = new Date(
      refreshTokenPayload.exp * 1000,
    );

    await this.userRepository.createUserSession({
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
