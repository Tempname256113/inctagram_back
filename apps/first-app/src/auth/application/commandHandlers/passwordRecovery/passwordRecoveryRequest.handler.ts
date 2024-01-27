import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { add } from 'date-fns';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { NodemailerService } from '../../../utils/nodemailer.service';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { USER_ERRORS } from '../../../variables/validationErrors.messages';
import { UserRepository } from '../../../repositories/user.repository';
import { UserPasswordRecoveryRequestDTO } from '../../../dto/passwordRecovery.dto';
import { RecaptchaService } from '../../../utils/recaptcha.service';

export class PasswordRecoveryRequestCommand {
  constructor(
    public readonly passwordRecoveryRequestDTO: UserPasswordRecoveryRequestDTO,
  ) {}
}

@CommandHandler(PasswordRecoveryRequestCommand)
export class PasswordRecoveryRequestHandler
  implements ICommandHandler<PasswordRecoveryRequestCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly nodemailerService: NodemailerService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  async execute({
    passwordRecoveryRequestDTO,
  }: PasswordRecoveryRequestCommand): Promise<void> {
    await this.recaptchaService.validateToken(
      passwordRecoveryRequestDTO.recaptchaToken,
    );

    const foundUser: User | null =
      await this.userQueryRepository.getUserByEmail(
        passwordRecoveryRequestDTO.email,
      );

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
    const userChangePasswordRequest =
      await this.userRepository.createUserChangePasswordRequest({
        userId: data.userId,
        passwordRecoveryCode: crypto.randomUUID(),
        expiresAt: add(new Date(), { days: 1 }),
      });

    this.nodemailerService.sendChangePasswordRequestMessage({
      email: data.email,
      userPasswordRecoveryCode: userChangePasswordRequest.passwordRecoveryCode,
    });
  }
}
