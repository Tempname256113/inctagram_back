import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString, Max } from 'class-validator';
import { parse } from 'date-fns';

export class BaseUserProfileDto {
  @IsOptional()
  @Transform(({ value }) => parse(value, 'dd.MM.yyyy', new Date()))
  @IsDate({ message: 'Invalid date' })
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  @Max(200)
  aboutMe?: string;
}
