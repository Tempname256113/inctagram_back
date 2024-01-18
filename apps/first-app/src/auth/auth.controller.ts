import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserLoginDTO, UserRegisterDTO } from './dto/user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { TokensService } from './utils/tokens.service';
import { refreshTokenCookieProp } from './variables/refreshToken.variable';
import {
  UserPasswordRecoveryDTO,
  UserPasswordRecoveryRequestDTO,
} from './dto/password-recovery.dto';
import { GoogleAuthGuard } from './guards/google.auth.guard';
import { RefreshTokenPayloadType } from './types/tokens.models';
import { UserRepository } from './repositories/user.repository';
import { Cookies } from './decorators/cookies.decorator';
import { Request as Req, Response as Res } from 'express';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import {
  GithubAuthRouteSwaggerDescription,
  LoginRouteSwaggerDescription,
  LogoutRouteSwaggerDescription,
  PasswordRecoveryRequestRouteSwaggerDescription,
  PasswordRecoveryRouteSwaggerDescription,
  RegisterRouteSwaggerDescription,
  UpdateTokensPairRouteSwaggerDescription,
} from '@swagger/auth';
import {
  LoginCommand,
  PasswordRecoveryCommand,
  PasswordRecoveryRequestCommand,
  RegistrationCommand,
} from '@commands/auth';
import { GithubAuthDto } from './dto/githubAuth.dto';
import {
  GithubAuthCommand,
  GithubUserInfo,
} from './application/commandHandlers/githubAuth.handler';

@Controller('auth')
@ApiTags('auth controllers')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokensService: TokensService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterRouteSwaggerDescription()
  async register(@Body() userRegistrationDTO: UserRegisterDTO) {
    await this.commandBus.execute(
      new RegistrationCommand({
        email: userRegistrationDTO.email,
        password: userRegistrationDTO.password,
        username: userRegistrationDTO.username,
      }),
    );

    return `We have sent a link to confirm your email to ${userRegistrationDTO.email}`;
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  @LoginRouteSwaggerDescription()
  async login(
    @Body() userLoginDTO: UserLoginDTO,
    @Response({ passthrough: true }) res: Res,
  ) {
    const userId: number | null = await this.commandBus.execute(
      new LoginCommand(userLoginDTO),
    );

    const { accessToken, refreshToken } =
      await this.tokensService.createTokensPair({ userId });

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

    res.cookie(refreshTokenCookieProp, refreshToken, {
      httpOnly: true,
      secure: true,
      expires: refreshTokenExpiresAtDate,
    });

    return { accessToken };
  }

  @Post('update-tokens-pair')
  @HttpCode(HttpStatus.CREATED)
  @UpdateTokensPairRouteSwaggerDescription()
  async updateTokensPair(
    @Cookies(refreshTokenCookieProp) refreshToken: string,
    @Response({ passthrough: true }) res: Res,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Provide refresh token in cookies for update tokens pair',
      );
    }

    const refreshTokenPayload: RefreshTokenPayloadType | null =
      await this.tokensService.verifyRefreshToken(refreshToken);

    if (!refreshTokenPayload) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    const newTokensPair = await this.tokensService.createTokensPair({
      userId: refreshTokenPayload.userId,
      uuid: refreshTokenPayload.uuid,
    });

    const newRefreshTokenPayload: RefreshTokenPayloadType =
      this.tokensService.getTokenPayload(newTokensPair.refreshToken);

    const newRefreshTokenExpiresAtDate: Date = new Date(
      newRefreshTokenPayload.exp * 1000,
    );

    const updatedSessionsAmount = await this.userRepository.updateUserSession({
      userId: newRefreshTokenPayload.userId,
      currentRefreshTokenUuid: refreshTokenPayload.uuid,
      newRefreshTokenUuid: newRefreshTokenPayload.uuid,
      refreshTokenExpiresAt: newRefreshTokenExpiresAtDate,
    });

    // если не обновилась ни одна сессия значит она не найдена. если не найдена значит рефреш токен не действительный
    if (updatedSessionsAmount.count < 1) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    res.cookie(refreshTokenCookieProp, refreshToken, {
      httpOnly: true,
      secure: true,
      expires: newRefreshTokenExpiresAtDate,
    });

    return { accessToken: newTokensPair.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @LogoutRouteSwaggerDescription()
  async logout(@Cookies(refreshTokenCookieProp) refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Provide refresh token for logout');
    }

    const refreshTokenPayload: RefreshTokenPayloadType | null =
      await this.tokensService.verifyRefreshToken(refreshToken);

    if (!refreshTokenPayload) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    await this.userRepository.deleteUserSession({
      userId: refreshTokenPayload.userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
    });

    return 'Logout success';
  }

  @Post('password-recovery-request')
  @HttpCode(HttpStatus.OK)
  @PasswordRecoveryRequestRouteSwaggerDescription()
  async passwordRecoveryRequest(
    @Body() passwordRecoveryRequestDTO: UserPasswordRecoveryRequestDTO,
  ) {
    await this.commandBus.execute(
      new PasswordRecoveryRequestCommand(passwordRecoveryRequestDTO),
    );
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.OK)
  @PasswordRecoveryRouteSwaggerDescription()
  async passwordRecovery(@Body() passwordRecoveryDTO: UserPasswordRecoveryDTO) {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(passwordRecoveryDTO),
    );
  }

  @ApiExcludeEndpoint()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleAuth() {
    return 'Google auth';
  }

  @ApiExcludeEndpoint()
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  @Redirect('/api/v1')
  async handleGoogleRedirect(
    @Request() req: Req,
    @Response({ passthrough: true }) res: Res,
  ) {
    const user: User = req.user as User;

    const userId: number = user.id;

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

    res.cookie(refreshTokenCookieProp, refreshToken, {
      httpOnly: true,
      secure: true,
      expires: refreshTokenExpiresAtDate,
    });
  }

  @Post('github-auth')
  @HttpCode(HttpStatus.OK)
  @GithubAuthRouteSwaggerDescription()
  async authViaGithub(
    @Body() githubAuthCode: GithubAuthDto,
    @Response({ passthrough: true }) res: Res,
  ): Promise<GithubUserInfo> {
    const userInfo: GithubUserInfo = await this.commandBus.execute(
      new GithubAuthCommand(githubAuthCode),
    );

    const refreshToken: string = await this.tokensService.createRefreshToken({
      userId: userInfo.userId,
      uuid: crypto.randomUUID(),
    });

    const refreshTokenPayload: RefreshTokenPayloadType =
      this.tokensService.getTokenPayload(refreshToken);

    // так как в JWT токене время в секундах, то его надо перевести в миллисекунды
    const refreshTokenExpiresAtDate: Date = new Date(
      refreshTokenPayload.exp * 1000,
    );

    await this.userRepository.createUserSession({
      userId: userInfo.userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
      expiresAt: refreshTokenExpiresAtDate,
    });

    res.cookie(refreshTokenCookieProp, refreshToken, {
      httpOnly: true,
      secure: true,
      expires: refreshTokenExpiresAtDate,
    });

    return userInfo;
  }

  // @ApiExcludeEndpoint()
  // @Get('github')
  // @UseGuards(GithubAuthGuard)
  // async handleGithubAuth() {
  //   return 'github auth';
  // }

  // @ApiExcludeEndpoint()
  // @Get('github/redirect')
  // @UseGuards(GithubAuthGuard)
  // @Redirect('/api/v1')
  // async handleGithubRedirect(
  //   @Request() req: Req,
  //   @Response({ passthrough: true }) res: Res,
  // ) {
  //   const user: User = req.user as User;
  //
  //   const userId: number = user.id;
  //
  //   const refreshToken: string = await this.tokensService.createRefreshToken({
  //     userId,
  //     uuid: crypto.randomUUID(),
  //   });
  //
  //   const refreshTokenPayload: RefreshTokenPayloadType =
  //     this.tokensService.getTokenPayload(refreshToken);
  //
  //   const refreshTokenExpiresAtDate: Date = new Date(
  //     refreshTokenPayload.exp * 1000,
  //   );
  //
  //   await this.userRepository.createUserSession({
  //     userId,
  //     refreshTokenUuid: refreshTokenPayload.uuid,
  //     expiresAt: refreshTokenExpiresAtDate,
  //   });
  //
  //   res.cookie(refreshTokenCookieProp, refreshToken, {
  //     httpOnly: true,
  //     secure: true,
  //     expires: refreshTokenExpiresAtDate,
  //   });
  // }
}
