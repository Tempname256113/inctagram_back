import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserRegistrationDTO } from '../../dto/user.dto';
import { BcryptService } from '../../utils/bcrypt.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { ConflictException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';

export class RegistrationCommand implements ICommand {
  constructor(public readonly userRegistrationDTO: UserRegistrationDTO) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationHandler
  implements ICommandHandler<RegistrationCommand, void>
{
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly nodemailerService: NodemailerService,
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
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

    const foundedUser =
      await this.userQueryRepository.getUserByEmailOrUsernameWithFullInfo({
        email,
        username,
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

          await this.userRepository.updateUserEmailInfoByUserId(
            foundedUser.id,
            {
              expiresAt: add(new Date(), { days: 3 }),
              emailConfirmCode,
            },
          );

          this.nodemailerService.sendRegistrationConfirmMessage({
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

    await this.userRepository.createUser({
      user: {
        email,
        username,
        password: await this.bcryptService.encryptPassword(password),
      },
      emailInfo: {
        registrationConfirmCode: emailConfirmCode,
        registrationCodeEndDate: add(new Date(), { days: 3 }),
        emailIsConfirmed: false,
      },
    });

    this.nodemailerService.sendRegistrationConfirmMessage({
      email,
      confirmCode: emailConfirmCode,
    });
  }
}
