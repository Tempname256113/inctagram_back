import { Module } from '@nestjs/common';
import { FileResourseService } from './file-resourse.service';
import { FileResourseController } from './file-resourse.controller';
import { S3StorageAdapter } from 'shared/services/s3StorageAdapter.servece';
import { TokensService } from '../auth/utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'shared/database/prisma.service';

@Module({
  imports: [JwtModule],
  controllers: [FileResourseController],
  providers: [
    FileResourseService,
    S3StorageAdapter,
    TokensService,
    PrismaService,
  ],
  exports: [FileResourseService],
})
export class FileResourseModule {}
