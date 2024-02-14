import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { refreshTokenCookieTitle } from './auth/variables/refreshTokenTitle';

export class SwaggerConfig {
  constructor(private readonly app: INestApplication) {}

  public apply() {
    const config = new DocumentBuilder()
      .setTitle('Inctagram api')
      .addSecurity('bearer', {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'To access this route you need to provide access token in the headers bearer',
      })
      .addSecurity('cookie', {
        type: 'apiKey',
        name: refreshTokenCookieTitle,
        in: 'cookie',
        description:
          'To access this route, you need to provide refresh token in the cookies',
      })
      .setDescription('Inctagram api. Created by Temp256113 && ArtyomSunRise')
      .addTag('example tag')
      .build();

    const document = SwaggerModule.createDocument(this.app, config);
    SwaggerModule.setup('/api/v1/swagger', this.app, document);
  }
}
