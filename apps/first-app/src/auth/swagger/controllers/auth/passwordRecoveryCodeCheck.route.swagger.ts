import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import {
  PasswordRecoveryCodeCheckDTOSwagger,
  PasswordRecoveryCodeCheckResponseTypeSwagger,
} from '../../../dto/passwordRecovery.dto';

export const PasswordRecoveryCodeCheckRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiNoContentResponse({ description: 'Code is valid' }),
    ApiNotFoundResponse({
      description: 'User with provided password recovery code is not found',
    }),
    ApiGoneResponse({
      description: 'Provided password recovery code is expired',
      type: PasswordRecoveryCodeCheckResponseTypeSwagger,
    }),
    ApiBody({ type: PasswordRecoveryCodeCheckDTOSwagger }),
  );
};
