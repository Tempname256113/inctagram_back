import { IsNotEmpty, IsString } from 'class-validator';

export class GithubAuthDto {
  @IsString({ message: 'Provide github auth code' })
  @IsNotEmpty()
  code: string;
}
