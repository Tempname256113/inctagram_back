import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from '@lib/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from '@lib/database';
import { ChangePasswordRequestModule } from './change-password-request/change-password-request.module';

@Module({
  imports: [EnvModule, AuthModule, DatabaseModule, ChangePasswordRequestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
