import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { USER_ERRORS } from '../variables/validationErrors.messages';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDTO {
  @ApiProperty({
    description: 'The name of user. May contain 0-9; A-Z; a-z; _ ; -',
    example: 'Temp256113',
    minLength: 6,
    maxLength: 30,
    type: 'string',
    required: true,
  })
  @IsString({ message: 'Username must be a string' })
  @Matches(/^[0-9A-Za-z_-]*$/, {
    message: 'Username may contain: 0-9; A-Z; a-z; _ ; -',
  })
  @Length(6, 30, { message: 'Username must contains 6 - 30 length' })
  username: string;

  @IsEmail(
    {},
    { message: 'The email must match the format example@example.com' },
  )
  @ApiProperty({
    description: 'The email of user',
    example: 'email123@gmail.com',
    type: 'string',
    required: true,
  })
  email: string;

  @IsString()
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+|~\-=`{}[\]:;"'<>,.?/]).{6,}$/,
    {
      message: `Password must contain 0-9, a-z, A-Z, ! " # $ % &
' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _\` { | } ~`,
    },
  )
  @Length(6, 20, { message: 'Password must contains 6 - 20 length' })
  password: string;
}

export class UserLoginDTO {
  @IsEmail({}, { message: USER_ERRORS.EMAIL_OR_PASSWORD_INCORRECT })
  email: string;

  @IsString()
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+|~\-=`{}[\]:;"'<>,.?/]).{6,}$/,
    {
      message: USER_ERRORS.EMAIL_OR_PASSWORD_INCORRECT,
    },
  )
  @Length(6, 20, {
    message: USER_ERRORS.EMAIL_OR_PASSWORD_INCORRECT,
  })
  password: string;
}
