import { IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPostDto {
  @IsString()
  @Length(1, 500, { message: 'Description field may have only 500 length' })
  @ApiProperty({
    example: 'Some post description',
    maxLength: 500,
    minLength: 1,
  })
  description: string;

  @IsNumber()
  @ApiProperty({ example: 256113, description: 'Provide valid user post id' })
  userPostId: number;
}
