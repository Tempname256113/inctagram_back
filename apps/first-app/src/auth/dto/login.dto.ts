import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
  @IsEmail(
    {},
    { message: 'The email or password are incorrect. Try again please' },
  )
  @ApiProperty({
    description: 'The user email',
    example: 'email123@gmail.com',
  })
  email: string;

  @IsString()
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+|~\-=`{}[\]:;"'<>,.?/]).{6,}$/,
    {
      message: 'The email or password are incorrect. Try again please',
    },
  )
  @Length(6, 20, {
    message: 'The email or password are incorrect. Try again please',
  })
  @ApiProperty({
    description: `The user password`,
    example: 'temp256113Ac$',
  })
  password: string;
}
