import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { BaseUserProfileDto } from './base-user-profile.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserProfileDto extends BaseUserProfileDto {
  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  @IsDefined({ message: `username should not be null` })
  @Length(6, 30, { message: 'Username must contains 6 - 30 length' })
  @ApiProperty({ example: 'test username', required: false })
  username?: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  @IsDefined({ message: `firstName should not be null` })
  @Length(1, 50, { message: 'FirstName must contains 1 - 50 length' })
  @ApiProperty({ example: 'test firstname', required: false })
  firstName?: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((object, value) => value !== undefined)
  @IsDefined({ message: `lastName should not be null` })
  @Length(1, 50, { message: 'LastName must contains 1 - 50 length' })
  @ApiProperty({ example: 'test lastname', required: false })
  lastName?: string;
}
