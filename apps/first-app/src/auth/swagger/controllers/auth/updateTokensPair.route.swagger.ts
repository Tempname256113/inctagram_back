import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseDtoSwagger } from '../../dto/tokens.dto.swagger';

export const UpdateTokensPairRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update tokens pair' }),
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
