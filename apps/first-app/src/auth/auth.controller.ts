import {
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
import { refreshTokenProp } from './variables/refreshToken.variable';
import { PasswordRecoveryCommand } from './application/commandHandlers/passwordRecovery/password-recovery.handler';
import {
  UserPasswordRecoveryDTO,
  UserPasswordRecoveryRequestDTO,
} from './dto/password-recovery.dto';
import { PasswordRecoveryRequestCommand } from './application/commandHandlers/passwordRecovery/password-recovery-request.handler';
import { GoogleAuthGuard } from './guards/google.auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokensService: TokensService,
  ) {}

  @Post('registration')
  async registration(
    @Body() userRegistrationDTO: UserRegistrationDTO,
  ): Promise<string> {
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
  ): Promise<{ accessToken: string }> {
    const userId: number | null = await this.commandBus.execute(
      new LoginCommand(userLoginDTO),
    );

    const { accessToken, refreshToken } =
      await this.tokensService.createTokensPair(userId);

    res.cookie(refreshTokenProp, refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
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
