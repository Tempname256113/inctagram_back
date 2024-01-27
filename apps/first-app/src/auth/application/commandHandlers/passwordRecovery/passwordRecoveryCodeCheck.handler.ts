import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoneException, NotFoundException } from '@nestjs/common';
import { UserChangePasswordRequestStates } from '@prisma/client';
import { UserPasswordRecoveryCodeCheckDTO } from '../../../dto/passwordRecovery.dto';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import {
  AUTH_ERRORS,
  CHANGE_PASSWORD_REQUEST_ERRORS,
} from '../../../variables/validationErrors.messages';
import { UserRepository } from '../../../repositories/user.repository';
import { BcryptService } from '../../../utils/bcrypt.service';
import { isBefore } from 'date-fns';

export class PasswordRecoveryCodeCheckCommand {
  constructor(
    public readonly passwordRecoveryDTO: UserPasswordRecoveryCodeCheckDTO,
  ) {}
}

@CommandHandler(PasswordRecoveryCodeCheckCommand)
export class PasswordRecoveryCodeCheckHandler
  implements ICommandHandler<PasswordRecoveryCodeCheckCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({
    passwordRecoveryDTO,
  }: PasswordRecoveryCodeCheckCommand): Promise<void> {
    const foundChangePasswordRequest =
      await this.userQueryRepository.getPasswordRecoveryRequestByCode({
        recoveryCode: passwordRecoveryDTO.passwordRecoveryCode,
        state: UserChangePasswordRequestStates.pending,
        deleted: false,
      });

    if (!foundChangePasswordRequest) {
      throw new NotFoundException(CHANGE_PASSWORD_REQUEST_ERRORS.NOT_FOUND);
    }

    const passwordRecoveryCodeIsExpired = isBefore(
      foundChangePasswordRequest.expiresAt,
      new Date(),
    );

    if (passwordRecoveryCodeIsExpired) {
      await this.userRepository.softDeleteUserChangePasswordRequest(
        foundChangePasswordRequest.id,
      );

      throw new GoneException({
        message: AUTH_ERRORS.PASSWORD_TOKEN_EXPIRED,
        userEmail: foundChangePasswordRequest.user.email,
      });
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
