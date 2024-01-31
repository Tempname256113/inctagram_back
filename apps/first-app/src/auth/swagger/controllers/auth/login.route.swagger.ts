import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccessTokenResponseDtoSwagger } from '../../dto/tokens.dto.swagger';
import { LoginDtoSwagger } from '../../../dto/login.dto';

export const LoginRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Successful login',
      type: AccessTokenResponseDtoSwagger,
    }),
    ApiUnauthorizedResponse({
      description: 'The email or password are incorrect. Try again',
    }),
    ApiBody({ type: LoginDtoSwagger }),
  );
};
