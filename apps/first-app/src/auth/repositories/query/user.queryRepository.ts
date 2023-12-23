import { PrismaService } from '@database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUserByEmailOrUsernameWithFullInfo(data: {
    email: string;
    username: string;
  }) {
    const { email, username } = data;

    return this.prisma.user.findFirst({
      where: { OR: [{ username, email }] },
      include: { userEmailInfo: true },
    });
  }
}
