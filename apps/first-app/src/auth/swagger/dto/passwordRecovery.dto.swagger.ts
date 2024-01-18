import { ApiProperty } from '@nestjs/swagger';

export class UserPasswordRecoveryRequestDtoSwagger {
  @ApiProperty({
    description: 'The email of user',
    example: 'email123@gmail.com',
    type: 'string',
    required: true,
  })
  email: string;
}

export class UserPasswordRecoveryDtoSwagger {
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
