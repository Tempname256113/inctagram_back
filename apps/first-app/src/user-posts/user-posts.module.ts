import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { TokensService } from '../auth/utils/tokens.service';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserPostsController } from './user-posts.controller';
import { CreateUserPostHandler } from './application/createUserPost.handler';
import { FileResourseModule } from '../file-resourse/file-resource.module';
import { UserPostsRepository } from './repositories/userPosts.repository';
import { UpdateUserPostHandler } from './application/updateUserPost.handler';
import { UserPostsQueryRepository } from './repositories/userPosts.queryRepository';

const commandHandlers = [CreateUserPostHandler, UpdateUserPostHandler];

@Module({
  imports: [JwtModule, CqrsModule, FileResourseModule],
  controllers: [UserPostsController],
  providers: [
    TokensService,
    PrismaService,
    ...commandHandlers,
    UserPostsRepository,
    UserPostsQueryRepository,
  ],
})
export class UserPostsModule {}
