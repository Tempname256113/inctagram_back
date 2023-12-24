import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Response,
  UseGuards,
} from '@nestjs/common';
import { UserLoginDTO, UserRegistrationDTO } from './dto/user.dto';
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokensService: TokensService,
    private readonly userRepository: UserRepository,
  ) {}

  @Post('registration')
  async registration(@Body() userRegistrationDTO: UserRegistrationDTO) {
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
  async login(
    @Body() userLoginDTO: UserLoginDTO,
    @Response({ passthrough: true }) res,
  ) {
    const userId: number | null = await this.commandBus.execute(
      new LoginCommand(userLoginDTO),
    );

    const { accessToken, refreshToken } =
      await this.tokensService.createTokensPair(userId);

    const refreshTokenPayload: RefreshTokenPayloadType =
      this.tokensService.getTokenPayload(refreshToken);

    await this.userRepository.createUserSession({
      userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
      expiresAt: new Date(refreshTokenPayload.exp * 1000),
    });

    res.cookie(refreshTokenCookieProp, refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }

  @Post('logout')
  async logout(@Cookies(refreshTokenCookieProp) refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Provide refresh cookie for logout');
    }

    const refreshTokenPayload: RefreshTokenPayloadType | null =
      await this.tokensService.verifyRefreshToken(refreshToken);

    if (!refreshTokenPayload) {
      throw new BadRequestException('Refresh token is invalid');
    }

    await this.userRepository.deleteUserSession({
      userId: refreshTokenPayload.userId,
      refreshTokenUuid: refreshTokenPayload.uuid,
    });

    return 'Logout success';
  }

  @Post('password-recovery-request')
  async passwordRecoveryRequest(
    @Body() passwordRecoveryRequestDTO: UserPasswordRecoveryRequestDTO,
  ) {
    await this.commandBus.execute(
      new PasswordRecoveryRequestCommand(passwordRecoveryRequestDTO),
    );

    return { ok: true };
  }

  @Post('password-recovery')
  async passwordRecovery(@Body() passwordRecoveryDTO: UserPasswordRecoveryDTO) {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(passwordRecoveryDTO),
    );

    return { ok: true };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleAuth() {
    return 'Google auth';
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  @Redirect('http://localhost:3021/')
  async handleGoogleRedirect() {
    return 'Google ok';
  }
}
