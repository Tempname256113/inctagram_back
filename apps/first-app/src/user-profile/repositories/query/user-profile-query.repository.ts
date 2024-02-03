import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';

@Injectable()
export class UserProfileQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfile(userId: number) {
    return this.prismaService.userProfile.findUnique({ where: { userId } });
  }
}
