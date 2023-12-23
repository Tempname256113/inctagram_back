import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserQueryRepository } from '../repositories/query/user.queryRepository';
import { User } from '@prisma/client';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
  ) {
    super();
  }

  // сюда приходит первым параметром то, что передается в стратегии
  // в методе validate(). нужно передавать сюда email, но можно вообще что угодно
  serializeUser(email: string, done: (err, email) => void) {
    done(null, email);
  }

  // deserialize user вызывается когда запрос требует аутентификации
  // нужно проверить есть такой юзер у нас или нет. если нет то нужно чтобы зарегистрировался
  // на самом деле не знаю в каких кейсах может этот метод использоваться вообще. может тестировщики найдут
  async deserializeUser(email: string, done: (err, email) => void) {
    // у функции done() есть два параметра. первый это параметр ошибки, второй параметр для юзера
    const foundedUser: User | null =
      await this.userQueryRepository.getUserByEmail(email);
    foundedUser ? done(null, foundedUser) : done(null, null);
  }
}
