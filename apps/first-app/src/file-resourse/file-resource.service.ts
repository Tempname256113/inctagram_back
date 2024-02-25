import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { S3StorageAdapter } from 'shared/services/s3StorageAdapter.servece';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileResource, FileResourceTypes } from '@prisma/client';
import { flatten } from 'lodash';
import { FileResourceRepository } from 'shared/repositories/file-resourse.repository';
import { FileResourceQueryRepository } from 'shared/repositories/query/file-resource-query.repository';

type CanManageFileType = {
  userId: number;
  fileId: number | number[];
  type: FileResourceTypes;
};

@Injectable()
export class FileResourceService {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly fileResourceRepository: FileResourceRepository,
    private readonly fileResourceQueryRepository: FileResourceQueryRepository,
  ) {}

  getFileFolder(params: { type: FileResourceTypes; userId: number }) {
    switch (params.type) {
      case FileResourceTypes.profilePhoto:
        return `users/${params.userId}/profilePhoto`;
      default:
        throw new BadRequestException('File type not found');
    }
  }

  private async checkCountFileResource(data: CanManageFileType) {
    const fileIds: number[] = flatten([data.fileId]);

    // сюда передается массив с fileIds
    // если вернется из бд количество сущностей меньше чем передавалось
    // значит какие то из передаваемых fileIds были украдены у другого юзера
    const fileResourceCount = await this.fileResourceQueryRepository.getCount({
      fileIds,
      createdById: data.userId,
      type: data.type,
    });

    return fileResourceCount === fileIds.length;
  }

  async canManageFileResource(data: CanManageFileType) {
    const allEntitiesIsMine: boolean = await this.checkCountFileResource(data);

    if (data.fileId && !allEntitiesIsMine) {
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

    return this.fileResourceRepository.create({
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

    await this.fileResourceRepository.delete({ id: file.id });
  }
}
