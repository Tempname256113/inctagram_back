import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileResourseService } from './file-resourse.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'shared/guards/auth.guard';
import { User } from 'shared/decorators/user.decorator';
import { UserDecorator } from 'shared/types/user/user.type';
import { UploadFileDto } from './dto/upload-file.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateFileResourceRouteSwaggerDescription } from './swagger/createFileResource.swagger';

@ApiTags('file-resourses controller')
@Controller('file-resourse')
export class FileResourseController {
  constructor(private readonly fileResourseService: FileResourseService) {}

  @UseGuards(AuthGuard)
  @Post('/upload')
  @CreateFileResourceRouteSwaggerDescription()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @User() user: UserDecorator,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,

    @Body() uploadfileDto: UploadFileDto,
  ) {
    return this.fileResourseService.upload({
      userId: user.userId,
      file,
      data: uploadfileDto,
    });
  }
}
