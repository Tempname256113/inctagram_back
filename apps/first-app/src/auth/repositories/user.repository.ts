import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma/prisma.service';
import { Providers, User, UserEmailInfo } from '@prisma/client';

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
}
