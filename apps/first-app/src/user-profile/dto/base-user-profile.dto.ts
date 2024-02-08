import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString, Max } from 'class-validator';
import { parse } from 'date-fns';

export class BaseUserProfileDto {
  @IsOptional()
  @Transform(({ value }) => parse(value, 'dd.MM.yyyy', new Date()))
  @IsDate({ message: 'Invalid date' })
  @ApiProperty({ example: '11.04.2000', required: false })
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'German', required: false })
  country?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'London', required: false })
  city?: string;

  @IsString()
  @IsOptional()
  @Max(200)
  @ApiProperty({ example: 'some info', required: false })
  aboutMe?: string;
}
