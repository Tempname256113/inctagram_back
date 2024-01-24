import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString({ message: 'Provide google auth code' })
  @IsNotEmpty()
  code: string;
}
