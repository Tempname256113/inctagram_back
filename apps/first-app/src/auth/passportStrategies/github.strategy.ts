import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { Providers, User } from '@prisma/client';
import { UserQueryRepository } from '../repositories/query/user.queryRepository';
import { UserRepository } from '../repositories/user.repository';
import { NodemailerService } from '../utils/nodemailer.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userQueryRepository: UserQueryRepository,
    private readonly userRepository: UserRepository,
    private readonly nodemailerService: NodemailerService,
  ) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_REDIRECT_URL,
      scope: ['user:email'],
    });
  }

  // то что возвращается из этого метода попадает дальше в session serializer
  // в метод serializeUser первым параметром
  // поэтому я передаю здесь дальше юзера чтобы проверить что по юзеру

  // также то что возвращается из этого метода будет прикреплено к req.user

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const userEmail: string = profile.emails[0].value;

    const foundedUser: User | null =
      await this.userQueryRepository.getUserByEmail(userEmail);

    if (foundedUser) {
      await this.userRepository.updateUserEmailInfoByUserId(foundedUser.id, {
        provider: Providers.Github,
      });

      return foundedUser;
    }

    const newUser: User = await this.userRepository.createUser({
      user: { email: userEmail, username: profile.username },
      emailInfo: { provider: Providers.Github, emailIsConfirmed: true },
    });

    this.nodemailerService.sendRegistrationSuccessfulMessage(userEmail);

    return newUser;
  }
}
