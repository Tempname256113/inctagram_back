import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UserChangePasswordRequestStates } from '@prisma/client';
import { UserPasswordRecoveryDTO } from '../../../dto/passwordRecovery.dto';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import {
  AUTH_ERRORS,
  CHANGE_PASSWORD_REQUEST_ERRORS,
} from '../../../variables/validationErrors.messages';
import { UserRepository } from '../../../repositories/user.repository';
import { BcryptService } from '../../../utils/bcrypt.service';

export class PasswordRecoveryCommand {
  constructor(public readonly passwordRecoveryDTO: UserPasswordRecoveryDTO) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({
    passwordRecoveryDTO,
  }: PasswordRecoveryCommand): Promise<void> {
    const foundChangePasswordRequest =
      await this.userQueryRepository.getPasswordRecoveryRequestByCode({
        recoveryCode: passwordRecoveryDTO.passwordRecoveryCode,
        state: UserChangePasswordRequestStates.pending,
        deleted: false,
      });

    if (!foundChangePasswordRequest) {
      throw new BadRequestException(CHANGE_PASSWORD_REQUEST_ERRORS.NOT_FOUND);
    }

    if (
      new Date().getTime() >= foundChangePasswordRequest.expiresAt.getTime()
    ) {
      await this.userRepository.softDeleteUserChangePasswordRequest(
        foundChangePasswordRequest.id,
      );

      throw new BadRequestException(AUTH_ERRORS.PASSWORD_TOKEN_EXPIRED);
    }

    await this.userRepository.softDeleteUserChangePasswordRequest(
      foundChangePasswordRequest.id,
    );

    const passwordHash: string = await this.bcryptService.encryptPassword(
      passwordRecoveryDTO.password,
    );

    await this.userRepository.changeUserPassword({
      userId: foundChangePasswordRequest.userId,
      password: passwordHash,
    });
    // TODO: add transactions, drop all sessions users, think about softDelete
  }
}
