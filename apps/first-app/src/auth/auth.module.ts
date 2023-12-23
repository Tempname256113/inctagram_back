import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { PasswordRecoveryHandler } from './application/commandHandlers/passwordRecovery/password-recovery.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { BcryptService } from './utils/bcrypt.service';
import { UserRepository } from './repositories/user.repository';
import { UserQueryRepository } from './repositories/query/user.queryRepository';
import { PrismaService } from '@shared/database/prisma.service';
import { PasswordRecoveryRequestHandler } from './application/commandHandlers/passwordRecovery/password-recovery-request.handler';

const commandHandlers = [
  RegistrationHandler,
  LoginHandler,
  PasswordRecoveryRequestHandler,
  PasswordRecoveryHandler,
];

const repos = [UserRepository];

const queryRepos = [UserQueryRepository];

@Module({
  imports: [CqrsModule, JwtModule],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    ...repos,
    ...queryRepos,
    TokensService,
    NodemailerService,
    BcryptService,
    PrismaService,
  ],
})
export class AuthModule {}
