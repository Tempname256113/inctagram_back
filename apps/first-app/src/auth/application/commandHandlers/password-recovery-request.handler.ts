import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryRequestDTO } from '../../dto';
import { UserService } from 'apps/first-app/src/user/user.service';
import { ChangePasswordRequestService } from 'apps/first-app/src/change-password-request/change-password-request.service';
import * as crypto from 'crypto';
import { add } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { NodemailerService } from '@lib/shared/nodemailer';

export class PasswordRecoveryRequestCommand implements ICommand {
  constructor(
    public readonly passwordRecoveryRequestDTO: PasswordRecoveryRequestDTO,
  ) {}
}

@CommandHandler(PasswordRecoveryRequestCommand)
export class PasswordRecoveryRequestHandler
  implements ICommandHandler<PasswordRecoveryRequestCommand, void>
{
  constructor(
    private readonly userService: UserService,
    private readonly changePasswordRequestService: ChangePasswordRequestService,
    private readonly configService: ConfigService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute({
    passwordRecoveryRequestDTO,
  }: PasswordRecoveryRequestCommand): Promise<void> {
    const user = await this.userService.findUserByEmail(
      passwordRecoveryRequestDTO.email,
    );

    const lifetime = this.configService.get(
      'APP_CONFIG.EXPIRES.CHANGE_PASSWORD',
    );

    const changePasswordRequest =
      await this.changePasswordRequestService.create({
        userId: user.id,
        token: crypto.randomUUID(),
        expiresAt: add(new Date(), { days: lifetime }),
      });

    this.nodemailerService.sendChangePasswordRequestEmail({
      email: passwordRecoveryRequestDTO.email,
      token: changePasswordRequest.token,
    });
  }
}
