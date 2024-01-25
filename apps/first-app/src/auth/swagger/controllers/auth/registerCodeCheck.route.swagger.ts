import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiGoneResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { RegisterCodeCheckResponseTypeSwagger } from '../../dto/registerCodeCheckResponseType.swagger';
import { RegisterCodeCheckDtoSwagger } from '../../dto/registerCodeCheck.dto.swagger';

export const RegisterCodeCheckRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiBody({
      type: RegisterCodeCheckDtoSwagger,
      description: 'Provide a valid code from the email link',
      required: true,
    }),
    ApiNoContentResponse({ description: 'User email is confirmed' }),
    ApiNotFoundResponse({
      description: 'User with provided code is not found',
    }),
    ApiGoneResponse({
      description: 'Provided code is expired',
      type: RegisterCodeCheckResponseTypeSwagger,
    }),
  );
};
