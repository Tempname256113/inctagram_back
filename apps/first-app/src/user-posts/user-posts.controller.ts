import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  UnprocessableEntityException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../../../shared/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateUserPostDto } from './dto/createUserPost.dto';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserPostCommand } from './application/createUserPost.handler';
import { User } from '../../../../shared/decorators/user.decorator';
import { UserDecoratorType } from '../../../../shared/types/user/user.type';
import { CreateUserPostRouteSwaggerDescription } from './swagger/controller/createUserPost.route.swagger';
import { UpdateUserPostDto } from './dto/updateUserPost.dto';
import { UpdateUserPostCommand } from './application/updateUserPost.handler';
import { UpdateUserPostRouteSwaggerDescription } from './swagger/controller/updateUserPost.route.swagger';
import { UserPostReturnType } from './dto/userPostReturnTypes';
import { DeleteUserPostCommand } from './application/deleteUserPost.handler';
import { DeleteUserPostRouteSwaggerDescription } from './swagger/controller/deleteUserPost.route.swagger';
import { UserPostsQueryRepository } from './repositories/userPosts.queryRepository';

const picsErrorMessage = `The photo(s) must be less than or equal 0,5 Mb and have JPEG or PNG format`;

@ApiTags('user-posts controller')
@Controller('user-posts')
@UseGuards(AuthGuard)
export class UserPostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userPostsQueryRepository: UserPostsQueryRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10))
  @CreateUserPostRouteSwaggerDescription()
  createPost(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 500000,
          message: picsErrorMessage,
        })
        .addFileTypeValidator({ fileType: '.(png|jpeg)' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          exceptionFactory: () => {
            throw new UnprocessableEntityException(picsErrorMessage);
          },
        }),
    )
    postImages: Express.Multer.File[],
    @Body() createPostDto: CreateUserPostDto,
    @User() user: UserDecoratorType,
  ): Promise<UserPostReturnType> {
    return this.commandBus.execute(
      new CreateUserPostCommand({
        userId: user.userId,
        images: postImages,
        description: createPostDto.description,
      }),
    );
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UpdateUserPostRouteSwaggerDescription()
  async updatePost(
    @Body() updatePostDto: UpdateUserPostDto,
    @User() user: UserDecoratorType,
  ): Promise<UserPostReturnType> {
    return this.commandBus.execute(
      new UpdateUserPostCommand({
        userPostId: updatePostDto.userPostId,
        userId: user.userId,
        description: updatePostDto.description,
      }),
    );
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteUserPostRouteSwaggerDescription()
  async deletePost(
    @Param('postId') postId: number,
    @User() user: UserDecoratorType,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteUserPostCommand({ userPostId: postId, userId: user.userId }),
    );
  }

  @Get(':page')
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Param('page') page: number,
    @User() user: UserDecoratorType,
  ): Promise<UserPostReturnType[]> {
    return this.userPostsQueryRepository.getPostsByUserId({
      userId: user.userId,
      page,
    });
  }
}
