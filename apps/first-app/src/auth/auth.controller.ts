import { Body, Controller, Post, Response } from '@nestjs/common';
import { UserLoginDTO, UserRegistrationDTO } from './dto/user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './application/commandHandlers/registration.handler';
import { LoginCommand } from './application/commandHandlers/login.handler';
import { TokensService } from './utils/tokens.service';
import { refreshTokenProp } from './variables/refreshToken.variable';
import { PasswordRecoveryDTO, PasswordRecoveryRequestDTO } from './dto';
import { PasswordRecoveryRequestCommand } from './application/commandHandlers/password-recovery-request.handler';
import { PasswordRecoveryCommand } from './application/commandHandlers/password-recovery.handler';

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
    await this.commandBus.execute<RegistrationCommand, void>(
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
    const userId: number | null = await this.commandBus.execute<
      LoginCommand,
      number | null
    >(new LoginCommand(userLoginDTO));

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
    @Body() passwordRecoveryRequestDTO: PasswordRecoveryRequestDTO,
  ) {
    await this.commandBus.execute(
      new PasswordRecoveryRequestCommand(passwordRecoveryRequestDTO),
    );

    return { ok: true };
  }

  @Post('password-recovery')
  async passwordRecovery(@Body() passwordRecoveryDTO: PasswordRecoveryDTO) {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(passwordRecoveryDTO),
    );

    return { ok: true };
  }
}
