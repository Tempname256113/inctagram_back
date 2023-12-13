import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class UserRegistrationDTO {
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
  )
  @Length(6, 20, { message: 'Password must contains 6 - 20 length' })
  password: string;
}
