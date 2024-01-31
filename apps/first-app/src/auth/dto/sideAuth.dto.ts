import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SideAuthDto {
  @IsString({ message: 'Provide auth code' })
  @IsNotEmpty()
  code: string;
}

export class SideAuthDtoSwagger implements SideAuthDto {
  @ApiProperty({
    description: 'Code from api',
    example: 'temp256113',
    type: 'string',
    required: true,
  })
  code: string;
}
