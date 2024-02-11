import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserProfile } from '@prisma/client';
import { UserProfileRepository } from '../../../repositories/user-profile.repository';
import { differenceInYears } from 'date-fns';
import { BadRequestException } from '@nestjs/common';

export class CreateUserProfileCommand {
  constructor(
    public readonly data: {
      userId: number;
      username: string;
      firstName: string;
      lastName: string;
      dateOfBirth?: Date;
      country?: string;
      city?: string;
      aboutMe?: string;
    },
  ) {}
}

@CommandHandler(CreateUserProfileCommand)
export class CreateUserProfileHandler
  implements ICommandHandler<CreateUserProfileCommand, UserProfile>
{
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async execute(command: CreateUserProfileCommand) {
    const {
      data: { dateOfBirth, userId, ...values },
    } = command;

    const age = differenceInYears(new Date(), dateOfBirth);

    if (age < 13) {
      throw new BadRequestException(`A user under 13 cannot create a profile`);
    }

    return this.userProfileRepository.createProfile(userId, {
      dateOfBirth,
      ...values,
    });
  }
}
