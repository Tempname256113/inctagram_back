import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FileResourceService } from '../../file-resourse/file-resource.service';
import { UserPostsRepository } from '../repositories/userPosts.repository';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostCommand {
  constructor(
    public readonly data: {
      userId: number;
      images: Express.Multer.File[];
      description?: string;
    },
  ) {}
}

class CreatedPostImagesType {
  @ApiProperty({ type: 'number', example: 256113 })
  imageId: number;

  @ApiProperty({ type: 'string' })
  imageUrl: string;
}

export class CreateUserPostReturnType {
  @ApiProperty({ type: 'number', example: 33 })
  createdPostId: number;

  @ApiProperty({ type: 'string' })
  createdPostDescription?: string;

  @ApiProperty({ type: [CreatedPostImagesType] })
  createdPostImages: { imageId: number; imageUrl: string }[];
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreatePostCommand, CreateUserPostReturnType>
{
  constructor(
    private readonly imageService: FileResourceService,
    private readonly postsRepository: UserPostsRepository,
  ) {}

  async execute({
    data: command,
  }: CreatePostCommand): Promise<CreateUserPostReturnType> {
    const createdPost = await this.postsRepository.createPost({
      userId: command.userId,
      description: command.description,
    });

    const loadedImagesForPost =
      await this.imageService.uploadPostImagesToBucketAndDB({
        images: command.images,
        postId: createdPost.id,
        userId: command.userId,
      });

    return {
      createdPostId: createdPost.id,
      createdPostDescription: createdPost.description ?? null,
      createdPostImages: loadedImagesForPost
        .sort((a, b) => a.id - b.id)
        .map((loadedImage) => {
          return { imageId: loadedImage.id, imageUrl: loadedImage.url };
        }),
    };
  }
}
