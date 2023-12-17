import { PrismaService } from '@lib/database';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChangePasswordRequestDTO } from './dto';
import { CHANGE_PASSWORD_REQUEST_ERRORS } from '@lib/shared/constants';
import { ChangePasswordRequestStateEnum } from '@prisma/client';

@Injectable()
export class ChangePasswordRequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async findChangePasswordRequestByToken(token: string) {
    const changePasswordRequest =
      await this.prismaService.changePasswordRequest.findFirst({
        where: { token, state: ChangePasswordRequestStateEnum.pending },
      });

    if (!changePasswordRequest) {
      throw new BadRequestException(CHANGE_PASSWORD_REQUEST_ERRORS.NOT_FOUND);
    }

    return changePasswordRequest;
  }

  async create(createChangePasswordRequestDTO: CreateChangePasswordRequestDTO) {
    return this.prismaService.changePasswordRequest.create({
      data: createChangePasswordRequestDTO,
    });
  }

  async softDelete(id: number) {
    return this.prismaService.changePasswordRequest.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
