import { IsEmail } from 'class-validator';

export class PasswordRecoveryRequestDTO {
  @IsEmail()
  email: string;
}
