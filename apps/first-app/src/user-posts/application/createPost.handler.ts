import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FileResourceService } from '../../file-resourse/file-resource.service';
import { UserPostsRepository } from '../repositories/userPosts.repository';

export class CreatePostCommand {
  constructor(
    public readonly data: {
      userId: number;
      images: Express.Multer.File[];
      description?: string;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostHandler
  implements ICommandHandler<CreatePostCommand, void>
{
  constructor(
    private readonly imageService: FileResourceService,
    private readonly postsRepository: UserPostsRepository,
  ) {}

  async execute({ data: command }: CreatePostCommand): Promise<void> {
    const createdPost = await this.postsRepository.createPost({
      userId: command.userId,
      description: command.description,
    });
  }
}
