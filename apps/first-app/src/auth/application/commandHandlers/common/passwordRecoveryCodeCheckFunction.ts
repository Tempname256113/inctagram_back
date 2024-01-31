import { UserChangePasswordRequestStates } from '@prisma/client';
import { GoneException, NotFoundException } from '@nestjs/common';
import {
  AUTH_ERRORS,
  CHANGE_PASSWORD_REQUEST_ERRORS,
} from '../../../variables/validationErrors.messages';
import { isBefore } from 'date-fns';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { UserRepository } from '../../../repositories/user.repository';
import { PasswordRecoveryCodeCheckResponseTypeSwagger } from '../../../dto/passwordRecovery.dto';

export class PasswordRecoveryCodeCheckFunction {
  constructor(
    protected readonly dependencies: {
      userQueryRepository: UserQueryRepository;
      userRepository: UserRepository;
    },
  ) {}

  async checkPasswordRecoveryCode(passwordRecoveryCode: string) {
    const foundChangePasswordRequest =
      await this.dependencies.userQueryRepository.getPasswordRecoveryRequestByCode(
        {
          recoveryCode: passwordRecoveryCode,
          state: UserChangePasswordRequestStates.pending,
          deleted: false,
        },
      );

    if (!foundChangePasswordRequest) {
      throw new NotFoundException(CHANGE_PASSWORD_REQUEST_ERRORS.NOT_FOUND);
    }

    const passwordRecoveryCodeIsExpired = isBefore(
      foundChangePasswordRequest.expiresAt,
      new Date(),
    );

    if (passwordRecoveryCodeIsExpired) {
      await this.dependencies.userRepository.softDeleteUserChangePasswordRequest(
        foundChangePasswordRequest.id,
      );

      throw new GoneException({
        message: AUTH_ERRORS.PASSWORD_TOKEN_EXPIRED,
        userEmail: foundChangePasswordRequest.user.email,
      } as PasswordRecoveryCodeCheckResponseTypeSwagger);
    }

    return foundChangePasswordRequest;
  }
}
