import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { UserPasswordRecoveryRequestDtoSwagger } from '../../dto/passwordRecovery.dto.swagger';

export const PasswordRecoveryRequestRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOkResponse({ description: 'Password recovery code sent to email' }),
    ApiNotFoundResponse({
      description: 'Not found user with provided userId or email',
    }),
    ApiBody({ type: UserPasswordRecoveryRequestDtoSwagger }),
  );
};
