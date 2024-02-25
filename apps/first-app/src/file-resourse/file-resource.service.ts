import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { S3StorageAdapter } from 'shared/services/s3StorageAdapter.servece';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResource, FileResourceTypes } from '@prisma/client';
import { flatten } from 'lodash';
import { FileResourseRepository } from 'shared/repositories/file-resourse.repository';
import { FileResourseQueryRepository } from 'shared/repositories/query/file-resource-query.repository';

@Injectable()
export class FileResourseService {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly fileResourseRepository: FileResourseRepository,
    private readonly fileResourseQueryRepository: FileResourseQueryRepository,
  ) {}

  getFileFolder(params: { type: FileResourceTypes; userId: number }) {
    switch (params.type) {
      case FileResourceTypes.profilePhoto:
        return `users/${params.userId}/profilePhoto`;
      default:
        throw new BadRequestException('File type not found');
    }
  }

  private async checkCountFileResourse(data: {
    userId: number;
    fileId: number | number[];
    type: FileResourceTypes;
  }) {
    const fileIds: number[] = flatten([data.fileId]);

    const fileResourceCount = await this.fileResourseQueryRepository.getCount({
      fileIds,
      createdById: data.userId,
      type: data.type,
    });

    return fileResourceCount === fileIds.length;
  }

  async canManageFileResource(data: {
    userId: number;
    fileId: number;
    type: FileResourceTypes;
  }) {
    if (data.userId && (await this.checkCountFileResourse(data))) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }

  async upload({
    userId,
    file,
    data,
  }: {
    userId: number;
    file: Express.Multer.File;
    data: UploadFileDto;
  }) {
    const folder = this.getFileFolder({ userId, type: data.type });

    const { url, path } = await this.s3StorageAdapter.upload({ file, folder });

    return this.fileResourseRepository.create({
      type: data.type,
      contentType: file.mimetype,
      size: file.size,
      path,
      url,
      createdById: userId,
    });
  }

  async delete({ file }: { file: FileResource }) {
    await this.s3StorageAdapter.delete(file.path);

    await this.fileResourseRepository.delete({ id: file.id });
  }
}
