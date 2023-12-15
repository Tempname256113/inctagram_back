import { Body, Controller, Post } from '@nestjs/common';
import { UserRegistrationDTO } from './dto/user.dto';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './application/commandHandlers/registration.handler';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
