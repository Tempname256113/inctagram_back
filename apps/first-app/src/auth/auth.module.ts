import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { BcryptService } from './utils/bcrypt.service';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { PasswordRecoveryHandler } from './application/commandHandlers/passwordRecovery/passwordRecovery.handler';
import { UserRepository } from './repositories/user.repository';
import { UserQueryRepository } from './repositories/query/user.queryRepository';
import { PrismaService } from '@shared/database/prisma.service';
import { PasswordRecoveryRequestHandler } from './application/commandHandlers/passwordRecovery/passwordRecoveryRequest.handler';
import { GoogleStrategy } from './passportStrategies/google.strategy';
import { SessionSerializer } from './passportStrategies/session.serializer';
import { PassportModule } from '@nestjs/passport';
import { GithubStrategy } from './passportStrategies/github.strategy';
import { GithubAuthHandler } from './application/commandHandlers/githubAuth.handler';
import { GoogleAuthHandler } from './application/commandHandlers/googleAuth.handler';

const commandHandlers = [
  RegistrationHandler,
  LoginHandler,
  PasswordRecoveryRequestHandler,
  PasswordRecoveryHandler,
  GithubAuthHandler,
  GoogleAuthHandler,
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
    GithubStrategy,
    SessionSerializer,
  ],
})
export class AuthModule {}
