import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { BcryptService } from './utils/bcrypt.service';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { DatabaseModule } from 'lib/database';

const commandHandlers = [RegistrationHandler, LoginHandler];

@Module({
  imports: [CqrsModule, JwtModule, DatabaseModule],
  controllers: [AuthController],
  providers: [
    NodemailerService,
    ...commandHandlers,
    BcryptService,
    TokensService,
  ],
})
export class AuthModule {}
