import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
  UserChangePasswordRequest,
  UserChangePasswordRequestStates,
} from '@prisma/client';
import { User } from '@prisma/client';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUserChangePasswordRequest(data: {
    recoveryCode: string;
    state: UserChangePasswordRequestStates;
  }): Promise<UserChangePasswordRequest | null> {
    return this.prisma.userChangePasswordRequest.findFirst({
      where: {
        passwordRecoveryCode: data.recoveryCode,
        state: data.state,
      },
    });
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
