import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { CommandBus } from '@nestjs/cqrs';
import { refreshTokenCookieProp } from './variables/refreshToken.variable';
import {
  PasswordRecoveryCodeCheckDTO,
  PasswordRecoveryDto,
  PasswordRecoveryRequestDTO,
} from './dto/passwordRecovery.dto';
import { Cookies } from './decorators/cookies.decorator';
import { Response as Res } from 'express';
import { ApiTags } from '@nestjs/swagger';
import {
  LoginRouteSwaggerDescription,
  LogoutRouteSwaggerDescription,
  PasswordRecoveryRequestRouteSwaggerDescription,
  PasswordRecoveryCodeCheckRouteSwaggerDescription,
  RegisterCodeCheckRouteSwaggerDescription,
  RegisterRouteSwaggerDescription,
  SideAuthRouteSwaggerDescription,
  UpdateTokensPairRouteSwaggerDescription,
  ResendRegisterEmailRouteSwaggerDescription,
  PasswordRecoveryRouteSwaggerDescription,
} from '@swagger/auth';
import {
  CheckRegisterCodeCommand,
  GithubAuthCommand,
  GoogleAuthCommand,
  LoginCommand,
  LogoutCommand,
  PasswordRecoveryCodeCheckCommand,
  PasswordRecoveryCommand,
  PasswordRecoveryRequestCommand,
  RegistrationCommand,
  ResendRegisterEmailCommand,
  UpdateTokensPairCommand,
} from '@commands/auth';
import { SideAuthResponseType } from './dto/response/sideAuth.responseType';
import { SideAuthDto } from './dto/sideAuth.dto';
import {
  RegisterCodeCheckDto,
  RegisterDTO,
  ResendRegisterEmailDto,
} from './dto/register.dto';

// надо чтобы задеплоить
@Controller('auth')
@ApiTags('auth controllers')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterRouteSwaggerDescription()
  async register(@Body() userRegistrationDTO: RegisterDTO): Promise<void> {
    await this.commandBus.execute(
      new RegistrationCommand({
        email: userRegistrationDTO.email,
        password: userRegistrationDTO.password,
        username: userRegistrationDTO.username,
      }),
    );
  }

  @Post('register-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegisterCodeCheckRouteSwaggerDescription()
  async checkRegisterCode(
    @Body() registerCode: RegisterCodeCheckDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CheckRegisterCodeCommand(registerCode.code),
    );
  }

  @Post('resend-register-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResendRegisterEmailRouteSwaggerDescription()
  async sendEmail(
    @Body() sendEmailInfo: ResendRegisterEmailDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResendRegisterEmailCommand(sendEmailInfo),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginRouteSwaggerDescription()
  async login(
    @Body() userLoginDTO: LoginDTO,
    @Response() res: Res,
  ): Promise<void> {
    await this.commandBus.execute(new LoginCommand({ userLoginDTO, res }));
  }

  @Post('update-tokens-pair')
  @HttpCode(HttpStatus.CREATED)
  @UpdateTokensPairRouteSwaggerDescription()
  async updateTokensPair(
    @Cookies(refreshTokenCookieProp) refreshToken: string,
    @Response() res: Res,
  ): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Provide refresh token in cookies for update tokens pair',
      );
    }

    await this.commandBus.execute(
      new UpdateTokensPairCommand({ refreshToken, res }),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @LogoutRouteSwaggerDescription()
  async logout(
    @Cookies(refreshTokenCookieProp) refreshToken: string,
  ): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException('Provide refresh token for logout');
    }

    await this.commandBus.execute(new LogoutCommand(refreshToken));
  }

  @Post('password-recovery-request')
  @HttpCode(HttpStatus.OK)
  @PasswordRecoveryRequestRouteSwaggerDescription()
  async passwordRecoveryRequest(
    @Body() passwordRecoveryRequestDTO: PasswordRecoveryRequestDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryRequestCommand(passwordRecoveryRequestDTO),
    );
  }

  @Post('password-recovery-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @PasswordRecoveryCodeCheckRouteSwaggerDescription()
  async passwordRecoveryCodeCheck(
    @Body() passwordRecoveryCodeCheckDTO: PasswordRecoveryCodeCheckDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryCodeCheckCommand(passwordRecoveryCodeCheckDTO),
    );
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @PasswordRecoveryRouteSwaggerDescription()
  async passwordRecovery(
    @Body() passwordRecoveryDTO: PasswordRecoveryDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryCommand({
        newPassword: passwordRecoveryDTO.password,
        passwordRecoveryCode: passwordRecoveryDTO.passwordRecoveryCode,
      }),
    );
  }

  @Post('google-auth')
  @HttpCode(HttpStatus.OK)
  @SideAuthRouteSwaggerDescription()
  async authViaGoogle(
    @Body() googleAuthCode: SideAuthDto,
    @Response({ passthrough: true }) res: Res,
  ): Promise<SideAuthResponseType> {
    return this.commandBus.execute(
      new GoogleAuthCommand({ googleCode: googleAuthCode.code, res }),
    );
  }

  @Post('github-auth')
  @HttpCode(HttpStatus.OK)
  @SideAuthRouteSwaggerDescription()
  async authViaGithub(
    @Body() githubAuthCode: SideAuthDto,
    @Response({ passthrough: true }) res: Res,
  ): Promise<SideAuthResponseType> {
    return this.commandBus.execute(
      new GithubAuthCommand({ githubCode: githubAuthCode.code, res }),
    );
  }
}
