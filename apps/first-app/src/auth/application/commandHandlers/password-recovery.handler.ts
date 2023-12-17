import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryDTO } from '../../dto';
import { ChangePasswordRequestService } from 'apps/first-app/src/change-password-request/change-password-request.service';
import { compareAsc } from 'date-fns';
import { BadRequestException } from '@nestjs/common';
import { AUTH_ERRORS } from '@lib/shared/constants';
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
    private readonly changePasswordRequestService: ChangePasswordRequestService,
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({
    passwordRecoveryDTO,
  }: PasswordRecoveryCommand): Promise<void> {
    const changePasswordRequest =
      await this.changePasswordRequestService.findChangePasswordRequestByToken(
        passwordRecoveryDTO.token,
      );

    if (compareAsc(changePasswordRequest.expiresAt, new Date()) === -1) {
      await this.changePasswordRequestService.softDelete(
        changePasswordRequest.id,
      );

      throw new BadRequestException(AUTH_ERRORS.PASSWORD_TOKEN_EXPIRED);
    }

    await this.prismaService.changePasswordRequest.update({
      where: { id: changePasswordRequest.id },
      data: {
        state: ChangePasswordRequestStateEnum.processed,
        processedAt: new Date(),
      },
    });

    const passwordDigest = await this.bcryptService.encryptPassword(
      passwordRecoveryDTO.password,
    );

    await this.prismaService.user.update({
      where: { id: changePasswordRequest.userId },
      data: {
        password: passwordDigest,
      },
    });

    // TODO: add transactions, drop all sessions users, think about softDelete
  }
}
