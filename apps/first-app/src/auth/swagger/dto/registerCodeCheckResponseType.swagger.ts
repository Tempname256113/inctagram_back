import { ApiProperty } from '@nestjs/swagger';

export class RegisterCodeCheckResponseTypeSwagger {
  @ApiProperty({
    description: 'User email of provided code',
    example: 1,
    type: 'number',
  })
  userEmail: string;

  @ApiProperty({ description: 'Just message', type: 'string' })
  message: string;
}
