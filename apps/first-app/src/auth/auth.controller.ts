import { Controller, Post } from '@nestjs/common';
import { UserRegistrationDTO } from './dto/user.dto';

@Controller('auth')
export class AuthController {
  @Post('registration')
  async registration(userRegistrationDTO: UserRegistrationDTO): Promise<void> {}
}
