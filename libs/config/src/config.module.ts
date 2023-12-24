import { ConfigModule } from '@nestjs/config';
import appConfig from './config.service';

export const EnvModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [appConfig],
});
