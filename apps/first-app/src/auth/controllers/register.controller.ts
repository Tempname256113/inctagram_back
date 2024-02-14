import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterRouteSwaggerDescription } from '../swagger/controllers/auth/register.route.swagger';
import {
  RegisterCodeCheckDto,
  RegisterDTO,
  ResendRegisterEmailDto,
} from '../dto/register.dto';
import { RegistrationCommand } from '../application/commandHandlers/registration.handler';
import { RegisterCodeCheckRouteSwaggerDescription } from '../swagger/controllers/auth/registerCodeCheck.route.swagger';
import { CheckRegisterCodeCommand } from '../application/checkRegisterCode.handler';
import { ResendRegisterEmailRouteSwaggerDescription } from '../swagger/controllers/auth/resendRegisterEmail.route.swagger';
import { ResendRegisterEmailCommand } from '../application/commandHandlers/resendRegisterEmail.handler';

@Controller('auth')
@ApiTags('auth controller')
export class RegisterController {
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
}
