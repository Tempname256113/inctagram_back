import { Injectable } from '@nestjs/common';
import {
  Providers,
  User,
  UserChangePasswordRequest,
  UserEmailInfo,
  UserSession,
} from '@prisma/client';
import { PrismaService } from '@shared/database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userCreateDTO: {
    user: {
      username: string;
      email: string;
      password?: string;
    };
    emailInfo: {
      provider?: Providers;
      registrationCodeEndDate?: Date;
      registrationConfirmCode?: string;
      emailIsConfirmed: boolean;
    };
  }) {
    const { username, email, password = null } = userCreateDTO.user;

    const {
      provider = null,
      registrationCodeEndDate = null,
      registrationConfirmCode = null,
      emailIsConfirmed,
    } = userCreateDTO.emailInfo;

    const newUser = await this.prisma.user.create({
      data: {
        username,
        email,
        password,
        userEmailInfo: {
          create: {
            provider,
            emailIsConfirmed,
            expiresAt: registrationCodeEndDate,
            emailConfirmCode: registrationConfirmCode,
          },
        },
      },
      include: { userEmailInfo: true },
    });

    return newUser;
  }

  async updateUserById(
    userId: number,
    data: Partial<Omit<User, 'createdAt' | 'updatedAt' | 'id'>>,
  ) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async updateUserEmailInfoByUserId(
    userId: number,
    data: Partial<UserEmailInfo>,
  ) {
    return this.prisma.userEmailInfo.update({ where: { userId }, data });
  }

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

  async updateUserChangePasswordRequest(
    passwordRecoveryRequestId: number,
    data: Partial<
      Omit<
        UserChangePasswordRequest,
        'createdAt' | 'updatedAt' | 'userId' | 'id'
      >
    >,
  ) {
    return this.prisma.userChangePasswordRequest.update({
      where: { id: passwordRecoveryRequestId },
      data,
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

  async createUserSession(data: {
    userId: number;
    refreshTokenUuid: string;
    expiresAt: Date;
  }): Promise<UserSession> {
    return this.prisma.userSession.create({
      data: {
        userId: data.userId,
        refreshTokenUuid: data.refreshTokenUuid,
        expiresAt: data.expiresAt,
      },
    });
  }

  async updateUserSession(data: {
    userId: number;
    currentRefreshTokenUuid: string;
    newRefreshTokenUuid: string;
    refreshTokenExpiresAt: Date;
  }) {
    return this.prisma.userSession.updateMany({
      where: {
        userId: data.userId,
        refreshTokenUuid: data.currentRefreshTokenUuid,
      },
      data: {
        refreshTokenUuid: data.newRefreshTokenUuid,
        expiresAt: data.refreshTokenExpiresAt,
      },
    });
  }

  async deleteUserSession(data: {
    userId: number;
    refreshTokenUuid: string;
  }): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: { userId: data.userId, refreshTokenUuid: data.refreshTokenUuid },
    });
  }

  async deleteAllUserSessions(userId: number) {
    return this.prisma.userSession.deleteMany({ where: { userId } });
  }
}
