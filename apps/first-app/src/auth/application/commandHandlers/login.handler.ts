import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserLoginDTO } from '../../dto/user.dto';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { User } from '@prisma/client';
import { BcryptService } from '../../utils/bcrypt.service';

export class LoginCommand implements ICommand {
  constructor(public readonly userLoginDTO: UserLoginDTO) {}
}

// возвращает id юзера если логин прошел успешно. если нет то будет null
@CommandHandler(LoginCommand)
export class LoginHandler
  implements ICommandHandler<LoginCommand, number | null>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptUtils: BcryptService,
  ) {}

  async execute(command: LoginCommand): Promise<number | null> {
    const { userLoginDTO } = command;

    const foundedUser: User | null = await this.prisma.user.findUnique({
      where: { email: userLoginDTO.email },
    });

    if (!foundedUser) {
      return null;
    }

    const passwordIsCorrect: boolean =
      await this.bcryptUtils.compareHashAndPassword({
        password: userLoginDTO.password,
        hash: foundedUser.password,
      });

    return passwordIsCorrect ? foundedUser.id : null;
  }
}
