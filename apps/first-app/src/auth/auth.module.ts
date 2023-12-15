import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './auth.controller';
import { RegistrationHandler } from './application/commandHandlers/registration.handler';
import { NodemailerService } from '../utils/nodemailer.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BcryptService } from '../utils/bcrypt.service';

const commandHandlers = [RegistrationHandler];

@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [
    NodemailerService,
    ...commandHandlers,
    PrismaService,
    BcryptService,
  ],
})
export class AuthModule {}
