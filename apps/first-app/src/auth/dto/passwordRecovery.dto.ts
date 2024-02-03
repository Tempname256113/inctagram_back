import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { USER_ERRORS } from '../variables/validationErrors.messages';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryCodeCheckDTO {
  @IsString()
  @IsNotEmpty()
  passwordRecoveryCode: string;
}

export class PasswordRecoveryCodeCheckDTOSwagger
  implements PasswordRecoveryCodeCheckDTO
{
  @ApiProperty({
    description: `Password recovery code from link on email`,
    example: '0b01b1f2-3227-4fec-8c7a-13c7be715f02',
    type: 'string',
    required: true,
  })
  passwordRecoveryCode: string;
}

export class PasswordRecoveryRequestDTO {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;
}

export class PasswordRecoveryRequestDTOSwagger
  implements PasswordRecoveryRequestDTO
{
  @ApiProperty({
    description: 'The email of user',
    example: 'email123@gmail.com',
    type: 'string',
    required: true,
  })
  email: string;

  @ApiProperty({ type: 'string', required: true })
  recaptchaToken: string;
}

export class PasswordRecoveryDto {
  @IsString()
  @IsNotEmpty()
  passwordRecoveryCode: string;

  @IsString()
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+|~\-=`{}[\]:;"'<>,.?/]).{6,}$/,
    { message: USER_ERRORS.PASSWORD_MUST_CONTAIN_SPECIAL_SYMBOLS },
  )
  @Length(6, 20, { message: 'Password must contains 6 - 20 length' })
  password: string;
}

export class PasswordRecoveryDtoSwagger implements PasswordRecoveryDto {
  @ApiProperty({
    description: `Password recovery code from link on email`,
    example: '0b01b1f2-3227-4fec-8c7a-13c7be715f02',
    type: 'string',
    required: true,
  })
  passwordRecoveryCode: string;

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

export class PasswordRecoveryCodeCheckResponseTypeSwagger {
  @ApiProperty({
    description: 'User email of provided code',
    example: 'temp.256113@gmail.com',
    type: 'string',
  })
  userEmail: string;

  @ApiProperty({ description: 'Just message', type: 'string' })
  message: string;
}
