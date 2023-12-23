import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { UserChangePasswordRequest } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUserChangePasswordRequest(data: {
    userId: number;
    passwordRecoveryCode: string;
    expiresAt: Date;
  }): Promise<UserChangePasswordRequest> {
    return this.prisma.userChangePasswordRequest.create({
      data: {
        userId: data.userId,
        passwordRecoveryCode: data.passwordRecoveryCode,
        expiresAt: data.expiresAt,
      },
    });
  }

  async softDeleteUserChangePasswordRequest(requestId: number): Promise<void> {
    await this.prisma.userChangePasswordRequest.update({
      where: { id: requestId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async changeUserPassword(data: { userId: number; password: string }) {
    return this.prisma.user.update({
      where: { id: data.userId },
      data: { password: data.password },
    });
  }
}
