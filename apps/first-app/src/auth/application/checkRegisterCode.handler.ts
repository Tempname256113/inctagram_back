import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../repositories/query/user.queryRepository';
import { GoneException, NotFoundException } from '@nestjs/common';
import { isBefore } from 'date-fns';
import { UserRepository } from '../repositories/user.repository';
import { NodemailerService } from '../utils/nodemailer.service';

export class CheckRegisterCodeCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(CheckRegisterCodeCommand)
export class CheckRegisterCodeHandler
  implements ICommandHandler<CheckRegisterCodeCommand, void>
{
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly nodemailerService: NodemailerService,
  ) {}
  async execute(command: CheckRegisterCodeCommand): Promise<void> {
    const foundUser = await this.userQueryRepository.getUserByConfirmEmailCode(
      command.code,
    );

    if (!foundUser) {
      throw new NotFoundException('User with provided code is not found');
    }

    const codeIsExpires: boolean = isBefore(
      foundUser.userEmailInfo.expiresAt,
      new Date(),
    );

    if (codeIsExpires) {
      throw new GoneException({
        message: 'Provided code is expired',
        userId: foundUser.id,
      });
    }

    await this.userRepository.updateUserEmailInfoByUserId(foundUser.id, {
      expiresAt: null,
      emailIsConfirmed: true,
      emailConfirmCode: null,
    });

    await this.nodemailerService.sendRegistrationSuccessfulMessage(
      foundUser.email,
    );
  }
}