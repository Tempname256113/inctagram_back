import { Injectable } from '@nestjs/common';
import { FileResourceTypes } from '@prisma/client';
import { PrismaService } from 'shared/database/prisma.service';

@Injectable()
export class FileResourseQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getCount(data: {
    fileIds: number[];
    createdById: number;
    type: FileResourceTypes;
  }) {
    return this.prismaService.fileResource.count({
      where: {
        id: { in: data.fileIds },
        createdById: data.createdById,
        type: data.type,
      },
    });
  }
}
