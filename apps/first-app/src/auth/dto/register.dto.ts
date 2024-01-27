import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterCodeDto {
  @IsString({ message: 'Provide register confirm code' })
  @IsNotEmpty()
  code: string;
}
