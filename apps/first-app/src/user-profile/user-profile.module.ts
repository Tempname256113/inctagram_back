import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { TokensService } from '../auth/utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { UserProfileQueryRepository } from './repositories/query/user-profile-query.repository';
import { UserProfileRepository } from './repositories/user-profile.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserProfileHandler } from './application/commandHandlers/userProfile/createUserProfile.handler';
import { PrismaService } from '@shared/database/prisma.service';
import { UserQueryRepository } from '../auth/repositories/query/user.queryRepository';
import { GetUserProfileHandler } from './application/commandHandlers/userProfile/getUserProfile.handler';
import { UpdateUserProfileHandler } from './application/commandHandlers/userProfile/updateUserProfile.handler';

const commandHandlers = [
  GetUserProfileHandler,
  CreateUserProfileHandler,
  UpdateUserProfileHandler,
];

const repos = [UserProfileRepository];

const queryRepos = [UserProfileQueryRepository, UserQueryRepository];

@Module({
  imports: [JwtModule, CqrsModule],
  controllers: [UserProfileController],
  providers: [
    TokensService,
    PrismaService,
    ...repos,
    ...queryRepos,
    ...commandHandlers,
  ],
})
export class UserProfileModule {}
