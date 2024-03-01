import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserPostsRepository } from '../repositories/userPosts.repository';
import { UserPostsQueryRepository } from '../repositories/userPosts.queryRepository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserPostReturnType } from '../dto/userPostReturnTypes';

export class UpdateUserPostCommand {
  constructor(
    public readonly data: {
      userId: number;
      userPostId: number;
      description: string;
    },
  ) {}
}

@CommandHandler(UpdateUserPostCommand)
export class UpdateUserPostHandler
  implements ICommandHandler<UpdateUserPostCommand, UserPostReturnType>
{
  constructor(
    private readonly postsRepository: UserPostsRepository,
    private readonly postsQueryRepository: UserPostsQueryRepository,
  ) {}

  async execute({
    data: command,
  }: UpdateUserPostCommand): Promise<UserPostReturnType> {
    const foundPost = await this.postsQueryRepository.getPostById(
      command.userPostId,
    );

    if (!foundPost) {
      throw new NotFoundException('Not found user post with provided id');
    }

    if (foundPost.userId !== command.userId) {
      throw new ForbiddenException(
        'The user post with the provided id does not belong to you',
      );
    }

    const updatedPost =
      await this.postsRepository.updatePostDescriptionByPostId({
        postId: command.userPostId,
        description: command.description,
      });

    return {
      postId: updatedPost.id,
      postDescription: updatedPost.description,
      postImages: updatedPost.images
        .sort((a, b) => a.id - b.id)
        .map((image) => {
          return { imageId: image.id, imageUrl: image.url };
        }),
    };
  }
}
