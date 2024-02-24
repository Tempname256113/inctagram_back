import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { TokensService } from '../auth/utils/tokens.service';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { UserPostsController } from './user-posts.controller';

@Module({
  imports: [JwtModule, CqrsModule],
  controllers: [UserPostsController],
  providers: [TokensService, PrismaService],
})
export class UserPostsModule {}
