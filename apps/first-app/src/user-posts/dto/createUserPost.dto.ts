import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserPostDto {
  @IsOptional()
  @IsString()
  @Length(1, 500, { message: 'Description field may have only 500 length' })
  @ApiProperty({
    example: 'Some post description',
    required: false,
    maxLength: 500,
  })
  description?: string;
}
