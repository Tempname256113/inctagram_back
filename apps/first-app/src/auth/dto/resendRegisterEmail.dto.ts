import { IsEmail } from 'class-validator';

export class ResendRegisterEmailDto {
  @IsEmail()
  userEmail: string;
}
