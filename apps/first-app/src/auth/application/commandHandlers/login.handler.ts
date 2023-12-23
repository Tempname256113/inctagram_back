import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserLoginDTO } from '../../dto/user.dto';
import { User } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { BcryptService } from '../../utils/bcrypt.service';
import { USER_ERRORS } from '../../variables/validationErrors.messages';

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
      throw new UnauthorizedException(USER_ERRORS.EMAIL_OR_PASSWORD_INCORRECT);
    }

    const passwordIsCorrect: boolean =
      await this.bcryptService.compareHashAndPassword({
        password: userLoginDTO.password,
        hash: foundedUser.password,
      });

    if (!passwordIsCorrect) {
      throw new UnauthorizedException(USER_ERRORS.EMAIL_OR_PASSWORD_INCORRECT);
    }

    return foundedUser.id;
  }
}
