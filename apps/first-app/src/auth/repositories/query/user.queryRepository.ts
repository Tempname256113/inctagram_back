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

  async getUserChangePasswordRequestByCode(data: {
    recoveryCode: string;
    state: UserChangePasswordRequestStates;
    deleted?: boolean;
  }): Promise<UserChangePasswordRequest | null> {
    const { recoveryCode, state, deleted = 'default' } = data;

    if (deleted === 'default') {
      return this.prisma.userChangePasswordRequest.findFirst({
        where: {
          passwordRecoveryCode: recoveryCode,
          state,
        },
      });
    }

    if (data.deleted) {
      return this.prisma.userChangePasswordRequest.findFirst({
        where: {
          passwordRecoveryCode: recoveryCode,
          state,
        },
      });
    } else {
      return this.prisma.userChangePasswordRequest.findFirst({
        where: {
          passwordRecoveryCode: recoveryCode,
          state,
          deletedAt: { not: null },
        },
      });
    }
  }

  async getUserByEmailOrUsernameWithFullInfo(data: {
    email: string;
    username: string;
  }) {
    const { email, username } = data;

    return this.prisma.user.findFirst({
      where: { OR: [{ username, email }] },
      include: { userEmailInfo: true, userChangePasswordRequests: true },
    });
  }
}
