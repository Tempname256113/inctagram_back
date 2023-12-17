import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { DatabaseModule } from 'lib/database';
import { BcryptModule } from 'lib/shared/bcrypt';
import { NodemailerModule } from 'lib/shared/nodemailer';

const commandHandlers = [RegistrationHandler, LoginHandler];

@Module({
  imports: [
    CqrsModule,
    JwtModule,
    DatabaseModule,
    BcryptModule,
    NodemailerModule,
  ],
  controllers: [AuthController],
  providers: [...commandHandlers, TokensService],
})
export class AuthModule {}
