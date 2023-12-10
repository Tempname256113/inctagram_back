import { Module } from '@nestjs/common';
import { SecondAppController } from './second-app.controller';
import { SecondAppService } from './second-app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../../config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`config/env/.env.development`],
      load: [appConfig],
      isGlobal: true,
    }),
  ],
  controllers: [SecondAppController],
  providers: [SecondAppService],
})
export class SecondAppModule {}
