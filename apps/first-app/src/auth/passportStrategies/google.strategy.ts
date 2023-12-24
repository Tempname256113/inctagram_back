import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UserRepository } from '../repositories/user.repository';
import { UserQueryRepository } from '../repositories/query/user.queryRepository';
import { NodemailerService } from '../utils/nodemailer.service';
import { Providers, User } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly nodemailerService: NodemailerService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
      scope: ['profile', 'email'],
    });
  }

  // то что возвращается из этого метода попадает дальше в session serializer
  // в метод serializeUser первым параметром
  // поэтому я передаю здесь дальше юзера чтобы проверить что по юзеру

  // также то что возвращается из этого метода будет прикреплено к req.user
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const userEmail: string = profile._json.email;

    const foundedUser: User | null =
      await this.userQueryRepository.getUserByEmail(userEmail);

    if (foundedUser) {
      await this.userRepository.updateUserEmailInfoByUserId(foundedUser.id, {
        provider: Providers.Google,
      });

      return foundedUser;
    }

    const newUser: User = await this.userRepository.createUser({
      user: { email: userEmail, username: profile._json.name },
      emailInfo: { provider: Providers.Google, emailIsConfirmed: true },
    });

    this.nodemailerService.sendRegistrationSuccessfulMessage(userEmail);

    return newUser;
  }
}
