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
}
