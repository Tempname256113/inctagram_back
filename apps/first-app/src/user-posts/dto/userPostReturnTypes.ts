import { ApiProperty } from '@nestjs/swagger';

class PostImagesType {
  @ApiProperty({ type: 'number', example: 256113 })
  imageId: number;

  @ApiProperty({ type: 'string' })
  imageUrl: string;
}

export class UserPostReturnType {
  @ApiProperty({ type: 'number', example: 33 })
  postId: number;

  @ApiProperty({ type: 'string' })
  postDescription?: string;

  @ApiProperty({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ type: 'timestamp' })
  updatedAt: Date;

  @ApiProperty({ type: [PostImagesType] })
  postImages: { imageId: number; imageUrl: string }[];
}
