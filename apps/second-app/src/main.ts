import { NestFactory } from '@nestjs/core';
import { SecondAppModule } from './second-app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(SecondAppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const configService = app.get(ConfigService);
  const port = configService.get<number>('generalConfig.secondAppPort');
  await app.listen(port);
  console.log('second app started on port 3000');
}
bootstrap();
