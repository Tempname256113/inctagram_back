import { SendEmailDto, SendEmailTypes } from '../../dto/sendEmail.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../repositories/user.repository';
import { NodemailerService } from '../../utils/nodemailer.service';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { add } from 'date-fns';

export class SendEmailsCommand {
  constructor(public readonly data: SendEmailDto) {}
}

@CommandHandler(SendEmailsCommand)
export class SendEmailHandler
  implements ICommandHandler<SendEmailsCommand, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: SendEmailsCommand): Promise<void> {
    const {
      data: { userId, emailType },
    } = command;

    if (emailType === SendEmailTypes.REGISTER_CONFIRM) {
      return this.sendRegisterConfirmEmailMessage(userId);
    }
  }

  async sendRegisterConfirmEmailMessage(userId: number): Promise<void> {
    const foundUser = await this.userQueryRepository.getUserById(userId);

    if (!foundUser) {
      throw new NotFoundException('User with provided id is not found');
    }

    const emailIsConfirmed: boolean = foundUser.userEmailInfo.emailIsConfirmed;

    if (emailIsConfirmed) {
      throw new BadRequestException(
        'User email with provided user id is already confirmed',
      );
    }

    const confirmEmailCode: string = crypto.randomUUID();

    await this.userRepository.updateUserEmailInfoByUserId(userId, {
      expiresAt: add(new Date(), { days: 3 }),
      emailConfirmCode: confirmEmailCode,
    });

    this.nodemailerService.sendRegistrationConfirmMessage({
      email: foundUser.email,
      confirmCode: confirmEmailCode,
    });
  }
}
