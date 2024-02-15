import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { S3StorageAdapter } from 'shared/services/s3StorageAdapter.servece';
import { UploadFileDto } from './dto/upload-file.dto';
import { PrismaService } from 'shared/database/prisma.service';
import { FileResource, FileResourceTypes, Prisma } from '@prisma/client';
import { flatten } from 'lodash';

@Injectable()
export class FileResourseService {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly prismaService: PrismaService,
  ) {}

  getFileFolder(params: { type: FileResourceTypes; userId: number }) {
    switch (params.type) {
      case FileResourceTypes.profilePhoto:
        return `users/${params.userId}/profilePhoto`;
      default:
        throw new BadRequestException('File type not found');
    }
  }

  private async checkCountFileResourse({
    userId,
    fileId,
    type,
  }: {
    userId: number;
    fileId: number | number[];
    type: FileResourceTypes;
  }) {
    const where: Prisma.FileResourceWhereInput = {
      id: { in: flatten([fileId]) },
      createdById: userId,
    };

    if (type) where.type = type;

    const fileResourceCount = await this.prismaService.fileResource.count({
      where,
    });

    return fileResourceCount === flatten([fileId]).length;
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

    return this.prismaService.fileResource.create({
      data: {
        type: data.type,
        contentType: file.mimetype,
        size: file.size,
        path,
        url,
        createdById: userId,
      },
    });
  }

  async delete({ file }: { file: FileResource }) {
    await this.s3StorageAdapter.delete(file.path);

    await this.prismaService.fileResource.delete({ where: { id: file.id } });
  }
}
