import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDtoSwagger {
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

export class UserLoginDtoSwagger {
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
