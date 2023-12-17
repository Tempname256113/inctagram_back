import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { PasswordRecoveryRequestHandler } from './application/commandHandlers/password-recovery-request.handler';
import { DatabaseModule } from '@lib/database';
import { BcryptModule } from '@lib/shared/bcrypt';
import { NodemailerModule } from '@lib/shared/nodemailer';
import { UserModule } from '../user/user.module';
import { ChangePasswordRequestModule } from '../change-password-request/change-password-request.module';

const commandHandlers = [
  RegistrationHandler,
  LoginHandler,
  PasswordRecoveryRequestHandler,
];

@Module({
  imports: [
    CqrsModule,
    JwtModule,
    DatabaseModule,
    BcryptModule,
    NodemailerModule,
    UserModule,
    ChangePasswordRequestModule,
  ],
  controllers: [AuthController],
  providers: [...commandHandlers, TokensService],
})
export class AuthModule {}
