import { IsNotEmpty, IsString } from 'class-validator';

export class SideAuthDto {
  @IsString({ message: 'Provide auth code' })
  @IsNotEmpty()
  code: string;
}
