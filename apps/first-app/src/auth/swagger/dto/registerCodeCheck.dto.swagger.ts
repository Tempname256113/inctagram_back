import { ApiProperty } from '@nestjs/swagger';

export class RegisterCodeCheckDtoSwagger {
  @ApiProperty({
    description: 'Email confirm code',
    example: '0b01b1f2-3227-4fec-8c7a-13c7be715f02',
    type: 'string',
  })
  code: string;
}
