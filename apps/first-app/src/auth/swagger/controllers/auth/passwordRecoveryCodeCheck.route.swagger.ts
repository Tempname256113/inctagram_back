import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UserPasswordRecoveryDtoSwagger } from '../../dto/passwordRecovery.dto.swagger';
import { PasswordRecoveryCodeCheckResponseTypeSwagger } from '../../dto/passwordRecoveryCodeCheckResponseType.swagger';

export const PasswordRecoveryRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiNoContentResponse({ description: 'Password was changed' }),
    ApiNotFoundResponse({
      description: 'User with provided password recovery code is not found',
    }),
    ApiGoneResponse({
      description: 'Provided password recovery code is expired',
      type: PasswordRecoveryCodeCheckResponseTypeSwagger,
    }),
    ApiBody({ type: UserPasswordRecoveryDtoSwagger }),
  );
};
