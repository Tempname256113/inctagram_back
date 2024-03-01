import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
import {
  CreateUserPostCommand,
  CreateUserPostReturnType,
} from './application/createUserPost.handler';
import { User } from '../../../../shared/decorators/user.decorator';
import { UserDecoratorType } from '../../../../shared/types/user/user.type';
import { CreateUserPostRouteSwaggerDescription } from './swagger/controller/createUserPost.route.swagger';
import { UpdateUserPostDto } from './dto/updateUserPost.dto';
import { UpdateUserPostCommand } from './application/updateUserPost.handler';
import { UpdateUserPostRouteSwaggerDescription } from './swagger/controller/updateUserPost.route.swagger';

const picsErrorMessage = `The photo(s) must be less than or equal 0,5 Mb and have JPEG or PNG format`;

@ApiTags('user-posts controller')
@Controller('user-posts')
// @UseGuards(AuthGuard)
export class UserPostsController {
  constructor(private readonly commandBus: CommandBus) {}

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
  ): Promise<CreateUserPostReturnType> {
    return this.commandBus.execute(
      new CreateUserPostCommand({
        userId: user.userId,
        images: postImages,
        description: createPostDto.description,
      }),
    );
  }

  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UpdateUserPostRouteSwaggerDescription()
  async updatePost(
    @Body() updatePostDto: UpdateUserPostDto,
    @User() user: UserDecoratorType,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateUserPostCommand({
        userPostId: updatePostDto.userPostId,
        userId: user.userId,
        description: updatePostDto.description,
      }),
    );
  }
}
