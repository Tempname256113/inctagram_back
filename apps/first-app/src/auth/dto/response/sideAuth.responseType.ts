import { ApiProperty } from '@nestjs/swagger';

export type SideAuthResponseType = {
  userId: number;
  username: string;
  accessToken: string;
};

export class SideAuthResponseTypeSwagger implements SideAuthResponseType {
  @ApiProperty({
    description: 'Created/found existed user id',
    example: 33,
  })
  userId: number;

  @ApiProperty({
    description: 'Name of user',
    example: 'temp256113',
  })
  username: string;

  @ApiProperty({
    description: 'Access token. Save it',
    example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
  })
  accessToken: string;
}
