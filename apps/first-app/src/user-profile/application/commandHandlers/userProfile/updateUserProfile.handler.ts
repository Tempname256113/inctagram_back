import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserProfile } from '@prisma/client';
import { UserProfileRepository } from '../../../repositories/user-profile.repository';
import { differenceInYears } from 'date-fns';
import { BadRequestException } from '@nestjs/common';

export class UpdateUserProfileCommand {
  constructor(
    public readonly data: {
      userId: number;
      username?: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: Date;
      country?: string;
      city?: string;
      aboutMe?: string;
    },
  ) {}
}

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler
  implements ICommandHandler<UpdateUserProfileCommand, UserProfile>
{
  constructor(private readonly userProfileRepository: UserProfileRepository) {}

  async execute(command: UpdateUserProfileCommand) {
    const {
      data: { dateOfBirth, userId, ...values },
    } = command;

    if (dateOfBirth) {
      this.checkAge(dateOfBirth);
    }

    return this.userProfileRepository.updateProfile(userId, {
      dateOfBirth,
      ...values,
    });
  }

  checkAge(dateOfBirth: Date) {
    const age = differenceInYears(new Date(), dateOfBirth);

    if (age < 13) {
      throw new BadRequestException(`A user under 13 cannot create a profile`);
    }

    return true;
  }
}
