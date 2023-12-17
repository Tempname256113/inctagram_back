import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvModule } from '@lib/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from '@lib/database';

@Module({
  imports: [EnvModule, AuthModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
