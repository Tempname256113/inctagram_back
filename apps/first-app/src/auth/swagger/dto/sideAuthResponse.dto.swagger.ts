import { ApiProperty } from '@nestjs/swagger';

export class SideAuthResponseDtoSwagger {
  @ApiProperty({
    description: 'Code from api',
    example: 'temp256113',
    type: 'string',
    required: true,
  })
  code: string;
}
