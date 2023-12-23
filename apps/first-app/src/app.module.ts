import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from '@app/config/config.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [EnvModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
