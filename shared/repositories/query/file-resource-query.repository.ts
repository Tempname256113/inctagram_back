import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'shared/database/prisma.service';

@Injectable()
export class FileResourseQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async count(where: Prisma.FileResourceWhereInput) {
    return this.prismaService.fileResource.count({ where });
  }
}
