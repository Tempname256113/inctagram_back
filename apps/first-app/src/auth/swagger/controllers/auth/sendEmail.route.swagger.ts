import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { SendEmailDtoSwagger } from '../../dto/sendEmail.dto.swagger';

export const SendEmailRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiBody({ type: SendEmailDtoSwagger, required: true }),
    ApiNoContentResponse({ description: 'The email has been sent' }),
    ApiNotFoundResponse({ description: 'User with provided id is not found' }),
    ApiBadRequestResponse({
      description: 'User email with provided user id is already confirmed',
    }),
  );
};
