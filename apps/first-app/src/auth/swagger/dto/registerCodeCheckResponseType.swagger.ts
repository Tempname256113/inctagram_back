import { ApiProperty } from '@nestjs/swagger';

export class RegisterCodeCheckResponseTypeSwagger {
  @ApiProperty({
    description: 'User id of provided code',
    example: 1,
    type: 'number',
  })
  userId: number;

  @ApiProperty({ description: 'Just message', type: 'string' })
  message: string;
}
