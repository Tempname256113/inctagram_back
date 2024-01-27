import { ApiProperty } from '@nestjs/swagger';

export class ResendRegisterEmailDtoSwagger {
  @ApiProperty({ type: 'number', required: true, example: 33 })
  userId: number;
}
