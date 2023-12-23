import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { NodemailerService } from './utils/nodemailer.service';
import { PrismaService } from '@database/prisma/prisma.service';
import { BcryptService } from './utils/bcrypt.service';
import { TokensService } from './utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHandler } from './application/commandHandlers/login.handler';
import { GoogleStrategy } from './passportStrategies/google.strategy';
import { SessionSerializer } from './passportStrategies/session.serializer';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from './repositories/user.repository';
import { UserQueryRepository } from './repositories/query/user.queryRepository';

const commandHandlers = [RegistrationHandler, LoginHandler];

const repos = [UserRepository];

const queryRepos = [UserQueryRepository];

@Module({
  imports: [CqrsModule, JwtModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [
    NodemailerService,
    ...commandHandlers,
    ...repos,
    ...queryRepos,
    PrismaService,
    BcryptService,
    TokensService,
    GoogleStrategy,
    SessionSerializer,
  ],
})
export class AuthModule {}
