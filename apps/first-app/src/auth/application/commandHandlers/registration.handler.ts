import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserRegistrationDTO } from '../../dto/user.dto';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { BcryptService } from '../../utils/bcrypt.service';
import { NodemailerService } from '../../utils/nodemailer.service';

export class RegistrationCommand implements ICommand {
  constructor(public readonly userRegistrationDTO: UserRegistrationDTO) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand, void>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly nodemailerService: NodemailerService,
  ) {}

  async execute(command: RegistrationCommand): Promise<void> {
    const {
      userRegistrationDTO: { password, email, username },
    } = command;

    // регистрируется новый юзер
    await this.registerNewUser({ email, username, password });
  }

  // возвращает true если не нужно регистрировать нового юзера
  // и false если новый юзер нужен
  async checkUsernameAndEmail(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean> {
    const { username, email, password } = data;

    const foundedUser = await this.prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      include: { userEmailInfo: true },
    });

    if (foundedUser?.username === username && foundedUser?.email === email) {
      if (!foundedUser.userEmailInfo.emailIsConfirmed) {
        const userPasswordIsCorrect: boolean =
          await this.bcryptService.compareHashAndPassword({
            password,
            hash: foundedUser.password,
          });

        if (userPasswordIsCorrect) {
          const emailConfirmCode: string = crypto.randomUUID();

          await this.prisma.userEmailInfo.update({
            where: { userId: foundedUser.id },
            data: {
              expiresAt: add(new Date(), { days: 3 }),
              emailConfirmCode: emailConfirmCode,
            },
          });

          this.nodemailerService.sendRegistrationConfirmEmail({
            email,
            confirmCode: emailConfirmCode,
          });

          return true;
        }
      }
    }

    if (foundedUser?.email === email) {
      throw new ConflictException('User with this email is already registered');
    } else if (foundedUser?.username === username) {
      throw new ConflictException(
        'User with this username is already registered',
      );
    }

    return false;
  }

  async registerNewUser(userRegisterDTO: UserRegistrationDTO): Promise<void> {
    const { username, email, password } = userRegisterDTO;

    // нужно создавать нового юзера или нет
    // возвращается false если нужно и true если не нужно
    const createNewUserOrNot: boolean = !(await this.checkUsernameAndEmail({
      email,
      username,
      password,
    }));

    if (!createNewUserOrNot) {
      return;
    }

    const emailConfirmCode: string = crypto.randomUUID();

    await this.prisma.user.create({
      data: {
        email,
        username,
        password: await this.bcryptService.encryptPassword(password),
        userEmailInfo: {
          create: {
            emailConfirmCode,
            expiresAt: add(new Date(), { days: 3 }),
            emailIsConfirmed: false,
          },
        },
      },
    });

    this.nodemailerService.sendRegistrationConfirmEmail({
      email,
      confirmCode: emailConfirmCode,
    });
  }
}
