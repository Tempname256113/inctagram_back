import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BcryptService } from './utils/bcrypt.service';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';

const commandHandlers = [RegistrationHandler, LoginHandler];

@Module({
  imports: [CqrsModule, JwtModule],
  controllers: [AuthController],
  providers: [
    NodemailerService,
    ...commandHandlers,
    PrismaService,
    BcryptService,
    TokensService,
  ],
})
export class AuthModule {}
