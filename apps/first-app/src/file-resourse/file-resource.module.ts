import { Module } from '@nestjs/common';
import { FileResourceService } from './file-resource.service';
import { FileResourseController } from './file-resource.controller';
import { S3StorageAdapter } from 'shared/services/s3StorageAdapter.servece';
import { TokensService } from '../auth/utils/tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { FileResourceRepository } from 'shared/repositories/file-resourse.repository';
import { FileResourceQueryRepository } from 'shared/repositories/query/file-resource-query.repository';
import { PrismaService } from 'shared/database/prisma.service';

@Module({
  imports: [JwtModule],
  controllers: [FileResourseController],
  providers: [
    FileResourceService,
    S3StorageAdapter,
    TokensService,
    FileResourceRepository,
    FileResourceQueryRepository,
    PrismaService,
  ],
  exports: [FileResourceService],
})
export class FileResourseModule {}
