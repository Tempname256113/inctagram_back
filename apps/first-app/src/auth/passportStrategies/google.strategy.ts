import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UserRepository } from '../repositories/user.repository';
import { UserQueryRepository } from '../repositories/query/user.queryRepository';
import { NodemailerService } from '../utils/nodemailer.service';
import { Providers } from '@prisma/client';

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
      callbackURL: 'http://localhost:3021/api/v1/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  // то что возвращается из этого метода попадает дальше в session serializer
  // в метод serializeUser первым параметром
  // поэтому я передаю здесь дальше только email чтобы проверить что по юзеру
  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const userEmail: string = profile._json.email;

    const foundedUser =
      await this.userQueryRepository.getUserByEmail(userEmail);

    if (foundedUser) return foundedUser.email;

    const newUser = await this.userRepository.createUser({
      user: { email: userEmail, username: profile._json.name },
      emailInfo: { provider: Providers.Google, emailIsConfirmed: true },
    });

    this.nodemailerService.sendRegistrationSuccessfulMessage(userEmail);

    return newUser.email;
  }
}
