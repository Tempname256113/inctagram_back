import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponseDtoSwagger {
  @ApiProperty({
    description: 'Access token. Save it',
    example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    type: 'string',
  })
  accessToken: string;

  @ApiProperty({ example: 33, type: 'number' })
  userId: number;

  @ApiProperty({ example: 'temp256113', type: 'string' })
  username: string;
}
