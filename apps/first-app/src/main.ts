import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationError } from 'class-validator';
import * as _ from 'lodash';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const constraints = validationErrors.map((error) => {
          return error.constraints;
        });

        const errors: string[] = [];

        constraints.forEach((elem) => {
          Object.entries(elem).forEach((el) => {
            errors.push(el[1]);
          });
        });

        const errorsWithoutDuplicates = _.uniq(errors);

        return new BadRequestException(errorsWithoutDuplicates);
      },
    }),
  );
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_CONFIG.FIRST_APP_PORT');
  await app.listen(port);
  console.log(`first app started on port ${port}`);
}
bootstrap();
