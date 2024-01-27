import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryCodeCheckResponseTypeSwagger {
  @ApiProperty({
    description: 'User email of provided code',
    example: 'temp.256113@gmail.com',
    type: 'string',
  })
  userEmail: string;

  @ApiProperty({ description: 'Just message', type: 'string' })
  message: string;
}
