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
    confirmationCode: string;
  }): Promise<void> {
    const { email, confirmationCode } = data;

    try {
      await this.transporter.sendMail({
        from: this.nodemailerEmailUser,
        to: email,
        subject: 'Confirm your registration please',
        html: `To confirm your registration follow link: <a href='http://localhost:3021/auth/registration/confirm/${confirmationCode}'>confirm registration</a>`,
      });
    } catch (err) {
      console.error(err);
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
