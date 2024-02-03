import { IsNotEmpty, IsString, Length } from 'class-validator';
import { BaseUserProfileDto } from './base-user-profile.dto';

export class CreateUserProfileDto extends BaseUserProfileDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 30, { message: 'Username must contains 6 - 30 length' })
  username: string;

  @Length(1, 50, { message: 'FirstName must contains 1 - 50 length' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Length(1, 50, { message: 'LastName must contains 1 - 50 length' })
  @IsNotEmpty()
  @IsString()
  lastName: string;
}
