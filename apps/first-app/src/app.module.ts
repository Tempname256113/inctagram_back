import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EnvModule } from '../../../shared/config/config.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { FileResourseModule } from './file-resourse/file-resourse.module';

@Module({
  imports: [AuthModule, EnvModule, UserProfileModule, FileResourseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
