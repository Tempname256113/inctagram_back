import { Module } from '@nestjs/common';
import { FileResourseService } from './file-resourse.service';
import { FileResourseController } from './file-resourse.controller';
import { S3StorageAdapter } from 'shared/services/s3StorageAdapter.servece';
import { TokensService } from '../auth/utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { FileResourseRepository } from 'shared/repositories/file-resourse.repository';
import { FileResourseQueryRepository } from 'shared/repositories/query/file-resource-query.repository';
import { PrismaService } from 'shared/database/prisma.service';

@Module({
  imports: [JwtModule],
  controllers: [FileResourseController],
  providers: [
    FileResourseService,
    S3StorageAdapter,
    TokensService,
    FileResourseRepository,
    FileResourseQueryRepository,
    PrismaService,
  ],
  exports: [FileResourseService],
})
export class FileResourseModule {}
