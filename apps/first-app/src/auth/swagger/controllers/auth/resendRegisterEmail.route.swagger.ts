import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ResendRegisterEmailDtoSwagger } from '../../../dto/register.dto';

export const ResendRegisterEmailRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiBody({ type: ResendRegisterEmailDtoSwagger, required: true }),
    ApiNoContentResponse({ description: 'The email has been sent' }),
    ApiNotFoundResponse({
      description: 'User with provided email is not found',
    }),
    ApiGoneResponse({
      description: 'User email is already confirmed',
    }),
  );
};
