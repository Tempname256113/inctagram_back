import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserPostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(data: { userId: number; description?: string }) {
    return this.prisma.userPost.create({
      data: {
        userId: data.userId,
        description: data.description ?? null,
      } as Prisma.UserPostUncheckedCreateInput,
      include: { images: true, user: true },
    });
  }

  async updatePostDescriptionByPostId(data: {
    postId: number;
    description: string;
  }) {
    return this.prisma.userPost.update({
      where: { id: data.postId },
      data: { description: data.description },
      include: { images: true, user: true },
    });
  }
}
