import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthGuard } from 'shared/guards/auth.guard';
import { User } from 'shared/decorators/user.decorator';
import { UserDecoratorType } from 'shared/types/user/user.type';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserProfileCommand } from './application/commandHandlers/userProfile/createUserProfile.handler';
import { UpdateUserProfileCommand } from './application/commandHandlers/userProfile/updateUserProfile.handler';
import { UserProfileQueryRepository } from './repositories/query/user-profile-query.repository';
import { CreateUserProfileRouteSwaggerDescription } from './swagger/controller/createUserProfile.route.swagger';
import { UpdateUserProfileRouteSwaggerDescription } from './swagger/controller/updateUserProfile.route.swagger';
import { GetUserProfileRouteSwaggerDescription } from './swagger/controller/getUserProfile.route.swagger';
import { ApiTags } from '@nestjs/swagger';

@Controller('user-profile')
@UseGuards(AuthGuard)
@ApiTags('user profile controller')
export class UserProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userProfileQueryRepository: UserProfileQueryRepository,
  ) {}

  @GetUserProfileRouteSwaggerDescription()
  @Get()
  async findOne(@User() user: UserDecoratorType) {
    return this.userProfileQueryRepository.getProfile(user.userId, {
      profileImage: { include: { image: true } },
    });
  }

  @CreateUserProfileRouteSwaggerDescription()
  @Post()
  async create(
    @User() user: UserDecoratorType,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ) {
    const userProfile = await this.commandBus.execute(
      new CreateUserProfileCommand({
        userId: user.userId,
        ...createUserProfileDto,
      }),
    );

    return userProfile;
  }

  @UpdateUserProfileRouteSwaggerDescription()
  @Patch()
  async update(
    @User() user: UserDecoratorType,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const userProfile = await this.commandBus.execute(
      new UpdateUserProfileCommand({
        userId: user.userId,
        ...updateUserProfileDto,
      }),
    );

    return userProfile;
  }
}
