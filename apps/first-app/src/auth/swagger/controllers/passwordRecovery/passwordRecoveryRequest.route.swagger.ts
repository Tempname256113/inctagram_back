import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export const PasswordRecoveryRequestRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Password recovery request' }),
    ApiOkResponse({ description: 'Password recovery code sent to email' }),
    ApiNotFoundResponse({
      description: 'Not found user with provided userId or email',
    }),
  );
};
