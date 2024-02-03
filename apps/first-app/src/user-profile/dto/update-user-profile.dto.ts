import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { BaseUserProfileDto } from './base-user-profile.dto';

export class UpdateUserProfileDto extends BaseUserProfileDto {
  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  @IsDefined({ message: `username should not be null` })
  @Length(6, 30, { message: 'Username must contains 6 - 30 length' })
  username?: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  @IsDefined({ message: `firstName should not be null` })
  @Length(1, 50, { message: 'FirstName must contains 1 - 50 length' })
  firstName?: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  @IsDefined({ message: `lastName should not be null` })
  @Length(1, 50, { message: 'LastName must contains 1 - 50 length' })
  lastName?: string;
}
