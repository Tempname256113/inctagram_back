import { Module } from '@nestjs/common';
import { ChangePasswordRequestService } from './change-password-request.service';
import { DatabaseModule } from '@lib/database';

@Module({
  imports: [DatabaseModule],
  providers: [ChangePasswordRequestService],
  exports: [ChangePasswordRequestService],
})
export class ChangePasswordRequestModule {}
