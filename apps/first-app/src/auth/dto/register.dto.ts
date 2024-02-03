import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { USER_ERRORS } from '../variables/validationErrors.messages';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
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
  email: string;

  @IsString()
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+|~\-=`{}[\]:;"'<>,.?/]).{6,}$/,
    { message: USER_ERRORS.PASSWORD_MUST_CONTAIN_SPECIAL_SYMBOLS },
  )
  @Length(6, 20, { message: 'Password must contains 6 - 20 length' })
  password: string;
}

export class RegisterDtoSwagger implements RegisterDTO {
  @ApiProperty({
    description: 'The name of user. May contain 0-9; A-Z; a-z; _ ; -',
    example: 'Temp256113',
    minLength: 6,
    maxLength: 30,
    type: 'string',
    required: true,
  })
  username: string;

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

export class RegisterCodeCheckDto {
  @IsString({ message: 'Provide register confirm code' })
  @IsNotEmpty()
  code: string;
}

export class RegisterCodeCheckDtoSwagger implements RegisterCodeCheckDto {
  @ApiProperty({
    description: 'Email confirm code',
    example: '0b01b1f2-3227-4fec-8c7a-13c7be715f02',
    type: 'string',
  })
  code: string;
}

export class RegisterCodeCheckResponseTypeSwagger {
  @ApiProperty({
    description: 'User email of provided code',
    example: 1,
    type: 'number',
  })
  userEmail: string;

  @ApiProperty({ description: 'Just message', type: 'string' })
  message: string;
}

export class ResendRegisterEmailDto {
  @IsEmail()
  userEmail: string;
}

export class ResendRegisterEmailDtoSwagger implements ResendRegisterEmailDto {
  @ApiProperty({
    type: 'string',
    required: true,
    example: 'temp.256113@gmail.com',
  })
  userEmail: string;
}
