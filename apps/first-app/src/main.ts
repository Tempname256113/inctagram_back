import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ValidationError } from 'class-validator';
import * as _ from 'lodash';
import * as session from 'express-session';
import * as passport from 'passport';
import { SwaggerConfig } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  new SwaggerConfig(app).apply();

  app.use(
    session({
      secret: 'topsecret',
      saveUninitialized: false,
      resave: false,
      cookie: { httpOnly: true, secure: true },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        // эта функция написана для того чтобы не дублировать ошибки
        // которые отправляет на клиент class validator
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
  const port: number = parseInt(process.env.PORT) || 3021;
  await app.listen(port);
  console.log(`first app started on port ${port}`);
}
bootstrap();
