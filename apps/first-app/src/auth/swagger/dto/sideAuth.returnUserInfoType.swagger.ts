import { ApiProperty } from '@nestjs/swagger';

export class SideAuthReturnUserInfoTypeSwagger {
  @ApiProperty({
    description: 'Created/found existed user id',
    example: 33,
    type: 'number',
  })
  userId: number;

  @ApiProperty({
    description: 'Name of user',
    example: 'temp256113',
    type: 'string',
  })
  username: string;

  @ApiProperty({
    description: 'Access token. Save it',
    example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    type: 'string',
  })
  accessToken: string;
}
