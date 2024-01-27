import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { USER_ERRORS } from '../variables/validationErrors.messages';

export class UserPasswordRecoveryDTO {
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

export class UserPasswordRecoveryRequestDTO {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  recaptchaToken: string;
}
