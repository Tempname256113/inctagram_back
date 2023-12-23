import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class NodemailerService {
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly nodemailerEmailUser: string;

  constructor(private readonly configService: ConfigService) {
    this.nodemailerEmailUser = this.configService.get<string>(
      'APP_CONFIG.EMAIL_USER',
    );

    this.transporter = createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.nodemailerEmailUser,
        pass: this.configService.get<string>('APP_CONFIG.EMAIL_PASS'),
      },
    });
  }

  async sendRegistrationConfirmMessage(data: {
    email: string;
    confirmCode: string;
  }): Promise<void> {
    const { email, confirmCode } = data;

    try {
      await this.transporter.sendMail({
        from: this.nodemailerEmailUser,
        to: email,
        subject: 'Confirm your registration please',
        html: `To confirm your registration follow link: <a href='http://localhost:3021/auth/registration/confirm/${confirmCode}'>confirm registration</a>`,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async sendChangePasswordRequestMessage({
    email,
    userPasswordRecoveryCode,
  }: {
    email: string;
    userPasswordRecoveryCode: string;
  }) {
    try {
      await this.transporter.sendMail({
        from: this.nodemailerEmailUser,
        to: email,
        subject: 'Password recovery',
        html: `To reset your password follow link: <a href='http://localhost:3021/auth/change-email?token=${userPasswordRecoveryCode}'>Password recovery</a>`,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async sendRegistrationSuccessfulMessage(email: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.nodemailerEmailUser,
        to: email,
        subject: 'Successful registration',
        html: `Thank you for registration on inctagram`,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
