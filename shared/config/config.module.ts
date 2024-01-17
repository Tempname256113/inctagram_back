import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config.service';

export const EnvModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [appConfig],
});
