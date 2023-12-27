import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Response,
  Request,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserLoginDTO, UserRegisterDTO } from './dto/user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './application/commandHandlers/registration.handler';
import { LoginCommand } from './application/commandHandlers/login.handler';
import { TokensService } from './utils/tokens.service';
import { refreshTokenCookieProp } from './variables/refreshToken.variable';
import { PasswordRecoveryCommand } from './application/commandHandlers/passwordRecovery/password-recovery.handler';
import {
  UserPasswordRecoveryDTO,
  UserPasswordRecoveryRequestDTO,
} from './dto/password-recovery.dto';
import { PasswordRecoveryRequestCommand } from './application/commandHandlers/passwordRecovery/password-recovery-request.handler';
import { GoogleAuthGuard } from './guards/google.auth.guard';
import { RefreshTokenPayloadType } from './types/tokens.models';
import { UserRepository } from './repositories/user.repository';
import { Cookies } from './decorators/cookies.decorator';
import { Request as Req, Response as Res } from 'express';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { GithubAuthGuard } from './guards/github.auth.guard';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  UserLoginDtoSwagger,
  UserRegisterDtoSwagger,
} from './swagger/user.dto.swagger';
import { AccessTokenResponseSwagger } from './swagger/tokens.types.swagger';
import {
  UserPasswordRecoveryRequestSwaggerDTO,
  UserPasswordRecoverySwaggerDTO,
} from './swagger/passwordRecovery.dto.swagger';

@Controller('auth')
@ApiTags('auth controller')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokensService: TokensService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'The user has been successfully created',
  })
  @ApiConflictResponse({
    description: 'The user with provided username or email already registered',
  })
  @ApiBody({ type: UserRegisterDtoSwagger })
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
  @ApiCreatedResponse({
    description: 'Successful login',
    type: AccessTokenResponseSwagger,
  })
  @ApiUnauthorizedResponse({
    description: 'The email or password are incorrect. Try again',
  })
  @ApiBody({ type: UserLoginDtoSwagger })
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
  @ApiCreatedResponse({
    description: 'The tokens pair successfully created',
    type: AccessTokenResponseSwagger,
  })
  @ApiUnauthorizedResponse({
    description: 'Provide refresh token in cookies for update tokens pair',
  })
  @ApiCookieAuth()
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
  @ApiOkResponse({ description: 'Logout success' })
  @ApiUnauthorizedResponse({
    description: 'Logout failed. Provide refresh token in cookies for logout',
  })
  @ApiCookieAuth()
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
  @ApiOkResponse({ description: 'Password recovery code sent to email' })
  @ApiNotFoundResponse({
    description: 'Not found user with provided credentials',
  })
  @ApiBody({ type: UserPasswordRecoveryRequestSwaggerDTO })
  async passwordRecoveryRequest(
    @Body() passwordRecoveryRequestDTO: UserPasswordRecoveryRequestDTO,
  ) {
    await this.commandBus.execute(
      new PasswordRecoveryRequestCommand(passwordRecoveryRequestDTO),
    );
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Password was changed' })
  @ApiBadRequestResponse({
    description:
      'User with provided password recovery code is not found or code is expired',
  })
  @ApiBody({ type: UserPasswordRecoverySwaggerDTO })
  async passwordRecovery(@Body() passwordRecoveryDTO: UserPasswordRecoveryDTO) {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(passwordRecoveryDTO),
    );
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiResponse({ description: 'Auth via google', status: 200 })
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

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiResponse({ description: 'Auth via github', status: 200 })
  async handleGithubAuth() {
    return 'github auth';
  }

  @ApiExcludeEndpoint()
  @Get('github/redirect')
  @UseGuards(GithubAuthGuard)
  @Redirect('/api/v1')
  async handleGithubRedirect(
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
}
