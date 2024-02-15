import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  FileResourceTypes,
  ProfileImagesKind,
  UserProfile,
} from '@prisma/client';
import { UserProfileRepository } from '../../../repositories/user-profile.repository';
import { differenceInYears } from 'date-fns';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'shared/database/prisma.service';
import { FileResourseService } from 'apps/first-app/src/file-resourse/file-resourse.service';

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
      fileId?: number;
    },
  ) {}
}

@CommandHandler(CreateUserProfileCommand)
export class CreateUserProfileHandler
  implements ICommandHandler<CreateUserProfileCommand, UserProfile>
{
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
    private readonly prismaService: PrismaService,
    private readonly fileResourceService: FileResourseService,
  ) {}

  async execute(command: CreateUserProfileCommand) {
    const {
      data: { dateOfBirth, userId, fileId, ...values },
    } = command;

    this.checkAge(dateOfBirth);

    await this.fileResourceService.canManageFileResource({
      userId,
      fileId,
      type: FileResourceTypes.profilePhoto,
    });

    const profile = await this.userProfileRepository.createProfile(userId, {
      dateOfBirth,
      ...values,
    });

    if (fileId) {
      await this.createUserProfileAvatart({
        profileId: userId,
        imageId: fileId,
        kind: ProfileImagesKind.avatar,
      });
    }

    return profile;
  }

  async createUserProfileAvatart(data: {
    profileId: number;
    imageId: number;
    kind: ProfileImagesKind;
  }) {
    return this.prismaService.profileImage.create({
      data,
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
