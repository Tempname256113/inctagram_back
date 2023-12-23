import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { BcryptService } from './utils/bcrypt.service';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { PasswordRecoveryHandler } from './application/commandHandlers/passwordRecovery/password-recovery.handler';
import { UserRepository } from './repositories/user.repository';
import { UserQueryRepository } from './repositories/query/user.queryRepository';
import { PrismaService } from '@shared/database/prisma.service';
import { PasswordRecoveryRequestHandler } from './application/commandHandlers/passwordRecovery/password-recovery-request.handler';
import { GoogleStrategy } from './passportStrategies/google.strategy';
import { SessionSerializer } from './passportStrategies/session.serializer';
import { PassportModule } from '@nestjs/passport';

const commandHandlers = [
  RegistrationHandler,
  LoginHandler,
  PasswordRecoveryRequestHandler,
  PasswordRecoveryHandler,
];

const repos = [UserRepository];

const queryRepos = [UserQueryRepository];

@Module({
  imports: [CqrsModule, JwtModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [
    ...commandHandlers,
    ...repos,
    ...queryRepos,
    TokensService,
    NodemailerService,
    BcryptService,
    PrismaService,
    GoogleStrategy,
    SessionSerializer,
  ],
})
export class AuthModule {}
