import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChangePasswordRequestDTO {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsDate()
  expiresAt: Date;
}
