import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { TokensService } from '../auth/utils/tokens.service';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserPostsController } from './user-posts.controller';
import { CreatePostHandler } from './application/createPost.handler';
import { FileResourseModule } from '../file-resourse/file-resource.module';
import { UserPostsRepository } from './repositories/userPosts.repository';

const commandHandlers = [CreatePostHandler];

@Module({
  imports: [JwtModule, CqrsModule, FileResourseModule],
  controllers: [UserPostsController],
  providers: [
    TokensService,
    PrismaService,
    ...commandHandlers,
    UserPostsRepository,
  ],
})
export class UserPostsModule {}
