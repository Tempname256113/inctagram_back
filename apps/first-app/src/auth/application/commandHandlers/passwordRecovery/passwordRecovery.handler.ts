import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryCodeCheckFunction } from '../common/passwordRecoveryCodeCheckFunction';
import { UserRepository } from '../../../repositories/user.repository';
import { UserQueryRepository } from '../../../repositories/query/user.queryRepository';
import { BcryptService } from '../../../utils/bcrypt.service';

export class PasswordRecoveryCommand {
  constructor(
    public readonly data: {
      newPassword: string;
      passwordRecoveryCode: string;
    },
  ) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryHandler
  extends PasswordRecoveryCodeCheckFunction
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly bcryptService: BcryptService,
  ) {
    super({ userQueryRepository, userRepository });
  }

  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const {
      data: { newPassword, passwordRecoveryCode },
    } = command;

    const foundChangePasswordRequest =
      await this.checkPasswordRecoveryCode(passwordRecoveryCode);

    await this.userRepository.softDeleteUserChangePasswordRequest(
      foundChangePasswordRequest.id,
    );

    const passwordHash: string =
      await this.bcryptService.encryptPassword(newPassword);

    await this.userRepository.changeUserPassword({
      userId: foundChangePasswordRequest.userId,
      password: passwordHash,
    });
    // TODO: add transactions, drop all sessions users, think about softDelete
  }
}
