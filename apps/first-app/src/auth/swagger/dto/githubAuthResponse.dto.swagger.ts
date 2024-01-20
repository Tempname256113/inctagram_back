import { ApiProperty } from '@nestjs/swagger';

export class GithubAuthResponseDtoSwagger {
  @ApiProperty({
    description: 'Code from github',
    example: 'temp256113',
    type: 'string',
    required: true,
  })
  code: string;
}
