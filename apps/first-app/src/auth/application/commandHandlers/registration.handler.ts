import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserRegisterDTO } from '../../dto/user.dto';
import { BcryptService } from '../../utils/bcrypt.service';
import { NodemailerService } from '../../utils/nodemailer.service';
import { add } from 'date-fns';
import * as crypto from 'crypto';
import { ConflictException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { UserQueryRepository } from '../../repositories/query/user.queryRepository';

export class RegistrationCommand implements ICommand {
  constructor(public readonly userRegisterDTO: UserRegisterDTO) {}
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
      userRegisterDTO: { password, email, username },
    } = command;

    // регистрируется новый юзер
    await this.registerNewUser({ email, username, password });
  }

  async checkUsernameAndEmail(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<'No need to create a new user' | 'Need to create a new user'> {
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

          return 'No need to create a new user';
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

    return 'Need to create a new user';
  }

  async registerNewUser(userRegisterDTO: UserRegisterDTO): Promise<void> {
    const { username, email, password } = userRegisterDTO;

    const createNewUserOrNot = await this.checkUsernameAndEmail({
      email,
      username,
      password,
    });

    if (createNewUserOrNot === 'No need to create a new user') {
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
