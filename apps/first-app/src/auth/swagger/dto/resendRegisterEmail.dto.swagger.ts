import { ApiProperty } from '@nestjs/swagger';

export class ResendRegisterEmailDtoSwagger {
  @ApiProperty({
    type: 'string',
    required: true,
    example: 'temp.256113@gmail.com',
  })
  userEmail: string;
}
