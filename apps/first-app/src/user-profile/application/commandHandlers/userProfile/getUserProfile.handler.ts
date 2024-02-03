import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserProfile } from '@prisma/client';
import { UserProfileQueryRepository } from '../../../repositories/query/user-profile-query.repository';

export class GetUserProfileCommand {
  constructor(
    public readonly data: {
      userId: number;
    },
  ) {}
}

@CommandHandler(GetUserProfileCommand)
export class GetUserProfileHandler
  implements ICommandHandler<GetUserProfileCommand, UserProfile>
{
  constructor(
    private readonly userProfileQueryRepository: UserProfileQueryRepository,
  ) {}

  async execute(command: GetUserProfileCommand) {
    const {
      data: { userId },
    } = command;

    return this.userProfileQueryRepository.getProfile(userId);
  }
}
