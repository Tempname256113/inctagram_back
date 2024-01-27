import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import {
  UserChangePasswordRequest,
  UserChangePasswordRequestStates,
} from '@prisma/client';

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { userEmailInfo: true },
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { userEmailInfo: true },
    });
  }

  async getPasswordRecoveryRequestByCode(data: {
    recoveryCode: string;
    state: UserChangePasswordRequestStates;
    deleted?: boolean;
  }): Promise<UserChangePasswordRequest | null> {
    const { recoveryCode, state, deleted = false } = data;

    return this.prisma.userChangePasswordRequest.findFirst({
      where: {
        passwordRecoveryCode: recoveryCode,
        state,
        deletedAt: deleted ? { not: null } : null,
      },
    });
  }

  async getUserByConfirmEmailCode(confirmEmailCode: string) {
    return this.prisma.user.findFirst({
      where: { userEmailInfo: { emailConfirmCode: confirmEmailCode } },
      include: { userEmailInfo: true },
    });
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
