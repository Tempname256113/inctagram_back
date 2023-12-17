import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class PasswordRecoveryDTO {
  @IsString()
  @IsNotEmpty()
  token: string;

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
