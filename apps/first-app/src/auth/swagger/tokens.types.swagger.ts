import { ApiProperty } from '@nestjs/swagger';
import * as crypto from 'crypto';

export class AccessTokenResponseSwagger {
  @ApiProperty({
    description: 'Access token. Save it',
    example: crypto.randomUUID(),
    type: 'string',
  })
  accessToken: string;
}
