import { NestFactory } from '@nestjs/core';
import { SecondAppModule } from './second-app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(SecondAppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
  console.log('second app started on port 3000');
}
bootstrap();
