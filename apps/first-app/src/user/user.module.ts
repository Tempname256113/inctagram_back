import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseModule } from '@lib/database';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
