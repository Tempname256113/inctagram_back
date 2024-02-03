import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RegisterDtoSwagger } from '../../../dto/register.dto';

export const RegisterRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiCreatedResponse({
      description: 'The user has been successfully created',
    }),
    ApiConflictResponse({
      description:
        'The user with provided username or email already registered',
    }),
    ApiBody({ type: RegisterDtoSwagger }),
  );
};
