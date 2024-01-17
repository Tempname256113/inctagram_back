import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseDtoSwagger } from '../../dto/tokens.dto.swagger';

export const UpdateTokensPairRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiCreatedResponse({
      description: 'The tokens pair successfully created',
      type: AccessTokenResponseDtoSwagger,
    }),
    ApiUnauthorizedResponse({
      description: 'Provide refresh token in cookies for update tokens pair',
    }),
    ApiCookieAuth(),
  );
};
