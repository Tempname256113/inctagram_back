import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserRegistrationDTO } from '../../dto/user.dto';
import { User } from '@prisma/client';
import { PrismaService } from '../../../../../../prisma/prisma.service';
import { BcryptService } from '../../../utils/bcrypt.service';
import { NodemailerService } from '../../../utils/nodemailer.service';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { ConflictException } from '@nestjs/common';

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
    private readonly nodemailerSerivce: NodemailerService,
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

    const foundedUser: User | null = await this.prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      include: { userAdditionalInfo: true },
    });

    if (foundedUser?.username === username && foundedUser?.email === email) {
      // если у юзера не подтвержден email значит ему надо выслать код
      // если нет то ничего высылать не надо
      if (!foundedUser.userAdditionalInfo.emailIsConfirmed) {
        const userPasswordIsCorrect: boolean =
          await this.bcryptService.compareHashAndPassword({
            password,
            hash: foundedUser.password,
          });

        // если username && email совпадают нужно проверить пароль
        // если пароль верный то юзер хочет получить новое письмо чтобы подтвердить почту
        // возможно у старого кода в письме кончилось время действия или юзер удалил
        if (userPasswordIsCorrect) {
          const registrationConfirmCode: string = crypto.randomUUID();

          // надо обновить запись в бд по этому юзеру
          await this.prisma.userAdditionalInfo.update({
            where: { userId: foundedUser.id },
            data: {
              registrationCodeEndDate: add(new Date(), { days: 3 }),
              registrationConfirmCode,
            },
          });

          // ждать не надо пока письмо придет
          this.nodemailerSerivce.sendRegistrationConfirmEmail({
            email,
            confirmationCode: registrationConfirmCode,
          });

          // нужно что то вернуть из функции чтобы было понятно что юзера регистрировать не надо
          return true;

          //   если username && email верные, не подтвержденный с почты аккаунт и неверный пароль
          //   то нужно поставить новый пароль и отправить сообщение про подтверждение регистрации
        } else if (!userPasswordIsCorrect) {
          const registrationConfirmCode: string = crypto.randomUUID();

          // обновляется пароль юзера, код для подтверждения регистрации и время на подтверждение
          await this.prisma.user.update({
            where: { email, username },
            data: {
              password: await this.bcryptService.encryptPassword(password),
              userAdditionalInfo: {
                update: {
                  registrationConfirmCode,
                  registrationCodeEndDate: add(new Date(), { days: 3 }),
                },
              },
            },
          });

          this.nodemailerSerivce.sendRegistrationConfirmEmail({
            email,
            confirmationCode: registrationConfirmCode,
          });

          // нужно что то вернуть из функции чтобы было понятно что юзера регистрировать не надо
          return true;
        }
      }
    }

    //   тут остальные кейсы

    // если уже есть юзер в системе с таким же email
    if (foundedUser.email === email) {
      throw new ConflictException('User with this email is already registered');
      //   если уже есть юзер в системе с таким же username
    } else if (foundedUser.username === username) {
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

    if (createNewUserOrNot) {
      const registrationConfirmCode: string = crypto.randomUUID();

      // создается новый юзер
      await this.prisma.user.create({
        data: {
          email,
          username,
          password: await this.bcryptService.encryptPassword(password),
          userAdditionalInfo: {
            create: {
              registrationConfirmCode,
              registrationCodeEndDate: add(new Date(), { days: 3 }),
              emailIsConfirmed: false,
            },
          },
        },
      });

      // новому юзеру отправляется код для подтверждения регистрации
      this.nodemailerSerivce.sendRegistrationConfirmEmail({
        email,
        confirmationCode: registrationConfirmCode,
      });
    }
  }
}
