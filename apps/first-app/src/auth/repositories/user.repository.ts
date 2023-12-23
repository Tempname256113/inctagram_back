import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { Providers, User, UserEmailInfo } from '@prisma/client';
import { UserChangePasswordRequest } from '@prisma/client';

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
  }): Promise<User> {
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
            registrationCodeEndDate,
            registrationConfirmCode,
          },
        },
      },
    });

    return newUser;
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
