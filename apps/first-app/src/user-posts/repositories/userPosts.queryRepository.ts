import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/database/prisma.service';

@Injectable()
export class UserPostsQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPostById(postId: number) {
    return this.prisma.userPost.findUnique({
      where: { id: postId },
      include: { user: true, images: true },
    });
  }
}
