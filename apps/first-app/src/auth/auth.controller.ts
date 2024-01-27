import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { UserLoginDTO, UserRegisterDTO } from './dto/user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { refreshTokenCookieProp } from './variables/refreshToken.variable';
import {
  UserPasswordRecoveryDTO,
  UserPasswordRecoveryRequestDTO,
} from './dto/passwordRecovery.dto';
import { Cookies } from './decorators/cookies.decorator';
import { Response as Res } from 'express';
import { ApiTags } from '@nestjs/swagger';
import {
  LoginRouteSwaggerDescription,
  LogoutRouteSwaggerDescription,
  PasswordRecoveryRequestRouteSwaggerDescription,
  PasswordRecoveryRouteSwaggerDescription,
  RegisterCodeCheckRouteSwaggerDescription,
  RegisterRouteSwaggerDescription,
  SideAuthRouteSwaggerDescription,
  UpdateTokensPairRouteSwaggerDescription,
  SendEmailRouteSwaggerDescription,
} from '@swagger/auth';
import {
  CheckRegisterCodeCommand,
  GithubAuthCommand,
  GoogleAuthCommand,
  LoginCommand,
  LogoutCommand,
  PasswordRecoveryCommand,
  PasswordRecoveryRequestCommand,
  RegistrationCommand,
  UpdateTokensPairCommand,
} from '@commands/auth';
import { SideAuthResponseType } from './dto/response/sideAuth.responseType';
import { SideAuthDto } from './dto/sideAuth.dto';
import { RegisterCodeDto } from './dto/register.dto';
import { SendEmailDto } from './dto/sendEmail.dto';
import { SendEmailsCommand } from './application/commandHandlers/sendEmails.handler';

@Controller('auth')
@ApiTags('auth controllers')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @RegisterRouteSwaggerDescription()
  async register(
    @Body() userRegistrationDTO: UserRegisterDTO,
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

  @Post('register-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RegisterCodeCheckRouteSwaggerDescription()
  async checkRegisterCode(
    @Body() registerCode: RegisterCodeDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CheckRegisterCodeCommand(registerCode.code),
    );
  }

  @Post('send-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SendEmailRouteSwaggerDescription()
  async sendEmail(@Body() sendEmailInfo: SendEmailDto): Promise<void> {
    //   надо будет дописать логику. нужно чтобы с этим роутом можно было присылать на почту сообщения про подтверждение регистрации
    //   и про смену пароля (если закончился по времени код то надо новый запрос сделать)
    await this.commandBus.execute(new SendEmailsCommand(sendEmailInfo));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @LoginRouteSwaggerDescription()
  async login(
    @Body() userLoginDTO: UserLoginDTO,
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
  ): Promise<string> {
    if (!refreshToken) {
      throw new UnauthorizedException('Provide refresh token for logout');
    }

    await this.commandBus.execute(new LogoutCommand(refreshToken));

    return 'Logout success';
  }

  @Post('password-recovery-request')
  @HttpCode(HttpStatus.OK)
  @PasswordRecoveryRequestRouteSwaggerDescription()
  async passwordRecoveryRequest(
    @Body() passwordRecoveryRequestDTO: UserPasswordRecoveryRequestDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryRequestCommand(passwordRecoveryRequestDTO),
    );
  }

  @Post('password-recovery-code-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @PasswordRecoveryRouteSwaggerDescription()
  async passwordRecovery(
    @Body() passwordRecoveryDTO: UserPasswordRecoveryDTO,
  ): Promise<void> {
    await this.commandBus.execute(
      new PasswordRecoveryCommand(passwordRecoveryDTO),
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
