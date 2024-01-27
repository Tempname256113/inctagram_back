import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export enum SendEmailTypes {
  REGISTER_CONFIRM = 'REGISTER_CONFIRM',
}

export class SendEmailDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @IsEnum(SendEmailTypes)
  emailType: SendEmailTypes;
}
