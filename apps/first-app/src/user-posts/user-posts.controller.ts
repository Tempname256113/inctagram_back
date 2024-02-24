import {
  Body,
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UnprocessableEntityException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../../../../shared/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/createPostDto';
import { ApiTags } from '@nestjs/swagger';

const picsErrorMessage = `The photo(s) must be less than or equal 0,5 Mb and have JPEG or PNG format`;

@ApiTags('user-posts controller')
@Controller('user-posts')
// @UseGuards(AuthGuard)
export class UserPostsController {
  constructor() {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
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
    postPics: Express.Multer.File[],
    @Body() CreatePostDto: CreatePostDto,
  ) {
    console.log('post pics', postPics);
    console.log('body', CreatePostDto);
  }
}
