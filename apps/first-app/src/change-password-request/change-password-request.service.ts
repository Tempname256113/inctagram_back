import { PrismaService } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { CreateChangePasswordRequestDTO } from './dto';

@Injectable()
export class ChangePasswordRequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createChangePasswordRequestDTO: CreateChangePasswordRequestDTO) {
    return this.prismaService.changePasswordRequest.create({
      data: createChangePasswordRequestDTO,
    });
  }
}
