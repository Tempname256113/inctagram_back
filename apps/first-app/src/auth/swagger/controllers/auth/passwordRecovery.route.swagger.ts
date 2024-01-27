import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { UserPasswordRecoveryDtoSwagger } from '../../dto/passwordRecovery.dto.swagger';

export const PasswordRecoveryRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiNoContentResponse({ description: 'Password was changed' }),
    ApiBadRequestResponse({
      description:
        'User with provided password recovery code is not found or code is expired',
    }),
    ApiBody({ type: UserPasswordRecoveryDtoSwagger }),
  );
};
