import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { AuthGuard } from 'shared/guards/auth.guard';
import { User } from 'shared/decorators/user.decorator';
import { UserDecorator } from 'shared/types/user/user.type';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserProfileCommand } from './application/commandHandlers/userProfile/createUserProfile.handler';
import { GetUserProfileCommand } from './application/commandHandlers/userProfile/getUserProfile.handler';
import { UpdateUserProfileCommand } from './application/commandHandlers/userProfile/updateUserProfile.handler';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(AuthGuard)
  @Get()
  async findOne(@User() user: UserDecorator) {
    const userProfile = await this.commandBus.execute(
      new GetUserProfileCommand({
        userId: user.userId,
      }),
    );

    return userProfile;
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @User() user: UserDecorator,
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

  @UseGuards(AuthGuard)
  @Patch()
  async update(
    @User() user: UserDecorator,
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
