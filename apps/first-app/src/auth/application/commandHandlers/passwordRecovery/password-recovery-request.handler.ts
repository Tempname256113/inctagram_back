import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import * as crypto from 'crypto';
import { add } from 'date-fns';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { NodemailerService } from '../../../utils/nodemailer.service';
import { User } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { USER_ERRORS } from '../../../variables/validationErrors.messages';
import { UserRepository } from '../../../repositories/user.repository';
import { UserPasswordRecoveryRequestDTO } from '../../../dto/password-recovery.dto';

export class PasswordRecoveryRequestCommand implements ICommand {
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
  ) {}

  async execute({
    passwordRecoveryRequestDTO,
  }: PasswordRecoveryRequestCommand): Promise<void> {
    const foundedUser: User | null =
      await this.userQueryRepository.getUserByEmail(
        passwordRecoveryRequestDTO.email,
      );

    if (!foundedUser) {
      throw new BadRequestException(USER_ERRORS.NOT_FOUND);
    }

    await this.sendChangePasswordMessageToUserEmail({
      userId: foundedUser.id,
      email: foundedUser.email,
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
