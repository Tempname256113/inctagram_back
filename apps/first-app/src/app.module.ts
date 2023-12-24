import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EnvModule } from '@shared/config/config.module';

@Module({
  imports: [AuthModule, EnvModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
