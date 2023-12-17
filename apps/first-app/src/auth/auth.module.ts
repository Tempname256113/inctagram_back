import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { DatabaseModule } from 'lib/database';
import { BcryptModule } from 'lib/shared/bcrypt';

const commandHandlers = [RegistrationHandler, LoginHandler];

@Module({
  imports: [CqrsModule, JwtModule, DatabaseModule, BcryptModule],
  controllers: [AuthController],
  providers: [NodemailerService, ...commandHandlers, TokensService],
})
export class AuthModule {}
