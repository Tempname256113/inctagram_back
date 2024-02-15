import { IsEnum } from 'class-validator';
import { FileResourceTypes } from '@prisma/client';

export class UploadFileDto {
  @IsEnum(FileResourceTypes)
  type: FileResourceTypes;
}
