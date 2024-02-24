import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'shared/database/prisma.service';

@Injectable()
export class FileResourseRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: Prisma.XOR<
      Prisma.FileResourceCreateInput,
      Prisma.FileResourceUncheckedCreateInput
    >,
  ) {
    return this.prismaService.fileResource.create({ data });
  }

  async delete<T>(where: Prisma.FileResourceWhereUniqueInput) {
    return this.prismaService.fileResource.delete({ where });
  }
}
