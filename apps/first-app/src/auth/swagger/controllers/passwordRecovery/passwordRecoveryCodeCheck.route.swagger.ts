import { applyDecorators } from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PasswordRecoveryCodeCheckResponseTypeSwagger } from '../../../dto/passwordRecovery.dto';

export const PasswordRecoveryCodeCheckRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Password recovery code check' }),
    ApiNoContentResponse({ description: 'Code is valid' }),
    ApiNotFoundResponse({
      description: 'User with provided password recovery code is not found',
    }),
    ApiGoneResponse({
      description: 'Provided password recovery code is expired',
      type: PasswordRecoveryCodeCheckResponseTypeSwagger,
    }),
  );
};
