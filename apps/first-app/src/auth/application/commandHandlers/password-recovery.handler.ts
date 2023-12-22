import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryDTO } from '../../dto';
import { compareAsc } from 'date-fns';
import { BadRequestException } from '@nestjs/common';
import {
  AUTH_ERRORS,
  CHANGE_PASSWORD_REQUEST_ERRORS,
} from '@lib/shared/constants';
import { PrismaService } from '@lib/database';
import { ChangePasswordRequestStateEnum } from '@prisma/client';
import { BcryptService } from '@lib/shared/bcrypt';

export class PasswordRecoveryCommand implements ICommand {
  constructor(public readonly passwordRecoveryDTO: PasswordRecoveryDTO) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({
    passwordRecoveryDTO,
  }: PasswordRecoveryCommand): Promise<void> {
    const changePasswordRequest = await this.findChangePasswordRequestByToken(
      passwordRecoveryDTO.token,
    );

    if (compareAsc(changePasswordRequest.expiresAt, new Date()) === -1) {
      await this.prismaService.changePasswordRequest.update({
        where: { id: changePasswordRequest.id },
        data: { deletedAt: new Date() },
      });

      throw new BadRequestException(AUTH_ERRORS.PASSWORD_TOKEN_EXPIRED);
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.changePasswordRequest.update({
        where: { id: changePasswordRequest.id },
        data: {
          state: ChangePasswordRequestStateEnum.processed,
          processedAt: new Date(),
        },
      });

      const passwordDigest = await this.bcryptService.encryptPassword(
        passwordRecoveryDTO.password,
      );

      await tx.user.update({
        where: { id: changePasswordRequest.userId },
        data: {
          password: passwordDigest,
        },
      });
    });

    // TODO: drop all sessions users
  }

  private async findChangePasswordRequestByToken(token: string) {
    const changePasswordRequest =
      await this.prismaService.changePasswordRequest.findFirst({
        where: { token, state: ChangePasswordRequestStateEnum.pending },
      });

    if (!changePasswordRequest) {
      throw new BadRequestException(CHANGE_PASSWORD_REQUEST_ERRORS.NOT_FOUND);
    }

    return changePasswordRequest;
  }
}
