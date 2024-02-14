import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { USER_ERRORS } from '../variables/validationErrors.messages';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDTO {
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

export class LoginDtoSwagger implements LoginDTO {
  @ApiProperty({
    description: 'The email of user',
    example: 'email123@gmail.com',
    type: 'string',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: `The password of user. Must contain 0-9, a-z, A-Z, ! " # $ % &
' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _\` { | } ~`,
    example: 'temp256113Ac$',
    minLength: 6,
    maxLength: 20,
    type: 'string',
    required: true,
  })
  password: string;
}
