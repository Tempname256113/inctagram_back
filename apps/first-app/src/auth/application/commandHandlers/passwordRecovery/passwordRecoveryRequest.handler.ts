import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { add } from 'date-fns';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { NodemailerService } from '../../../utils/nodemailer.service';
import { User, UserChangePasswordRequestStates } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { USER_ERRORS } from '../../../variables/validationErrors.messages';
import { UserRepository } from '../../../repositories/user.repository';

export class PasswordRecoveryRequestCommand {
  constructor(public readonly data: { email: string }) {}
}

@CommandHandler(PasswordRecoveryRequestCommand)
export class PasswordRecoveryRequestHandler
  implements ICommandHandler<PasswordRecoveryRequestCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute({
    data: { email },
  }: PasswordRecoveryRequestCommand): Promise<void> {
    const foundUser: User | null =
      await this.userQueryRepository.getUserByEmail(email);

    if (!foundUser) {
      throw new NotFoundException(USER_ERRORS.NOT_FOUND);
    }

    await this.sendChangePasswordMessageToUserEmail({
      userId: foundUser.id,
      email: foundUser.email,
    });
  }

  async sendChangePasswordMessageToUserEmail(data: {
    userId: number;
    email: string;
  }): Promise<void> {
    const foundChangePasswordRequest =
      await this.userQueryRepository.getPasswordRecoveryRequestByUserEmail({
        email: data.email,
        state: UserChangePasswordRequestStates.pending,
        deleted: false,
      });

    const passwordRecoveryCode: string = crypto.randomUUID();
    const expiresAt: Date = add(new Date(), { days: 1 });

    const sendEmailMessage = (): void => {
      this.nodemailerService.sendChangePasswordRequestMessage({
        email: data.email,
        userPasswordRecoveryCode: passwordRecoveryCode,
      });
    };

    if (foundChangePasswordRequest) {
      await this.userRepository.updateUserChangePasswordRequest(
        foundChangePasswordRequest.id,
        {
          expiresAt,
          passwordRecoveryCode,
          state: UserChangePasswordRequestStates.pending,
        },
      );

      sendEmailMessage();
    } else {
      await this.userRepository.createUserChangePasswordRequest({
        userId: data.userId,
        passwordRecoveryCode,
        expiresAt,
      });

      sendEmailMessage();
    }
  }
}
