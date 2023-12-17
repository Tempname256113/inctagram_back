import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserLoginDTO } from '../../dto/user.dto';
import { User } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { ErrorsMessagesEnum } from '../../variables/validationErrors.messages';
import { PrismaService } from '@lib/database';
import { BcryptService } from '@lib/shared/bcrypt';

export class LoginCommand implements ICommand {
  constructor(public readonly userLoginDTO: UserLoginDTO) {}
}

// возвращает id юзера если логин прошел успешно
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, number> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(command: LoginCommand): Promise<number> {
    const { userLoginDTO } = command;

    const foundedUser: User | null = await this.prisma.user.findUnique({
      where: { email: userLoginDTO.email },
    });

    if (!foundedUser) {
      throw new UnauthorizedException(
        ErrorsMessagesEnum.EMAIL_OR_PASSWORD_INCORRECT,
      );
    }

    const passwordIsCorrect: boolean =
      await this.bcryptService.compareHashAndPassword({
        password: userLoginDTO.password,
        hash: foundedUser.password,
      });

    if (!passwordIsCorrect) {
      throw new UnauthorizedException(
        ErrorsMessagesEnum.EMAIL_OR_PASSWORD_INCORRECT,
      );
    }

    return foundedUser.id;
  }
}
