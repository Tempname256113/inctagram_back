import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseDtoSwagger } from '../../dto/tokens.dto.swagger';
import { UserLoginDtoSwagger } from '../../dto/user.dto.swagger';

export const LoginRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiCreatedResponse({
      description: 'Successful login',
      type: AccessTokenResponseDtoSwagger,
    }),
    ApiUnauthorizedResponse({
      description: 'The email or password are incorrect. Try again',
    }),
    ApiBody({ type: UserLoginDtoSwagger }),
  );
};
