import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseDtoSwagger } from '../../dto/tokens.dto.swagger';

export const LoginRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Login' }),
    ApiOkResponse({
      description: 'Successful login',
      type: AccessTokenResponseDtoSwagger,
    }),
    ApiUnauthorizedResponse({
      description: 'The email or password are incorrect. Try again',
    }),
  );
};
