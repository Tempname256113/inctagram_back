import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const UpdateUserPostRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Update user post' }),
    ApiNoContentResponse({ description: 'User post was updated' }),
    ApiUnauthorizedResponse({
      description: 'You must provide valid access token to access this route',
    }),
    ApiNotFoundResponse({
      description: 'Not found user post with provided id',
    }),
    ApiForbiddenResponse({
      description: 'The user post with the provided id does not belong to you',
    }),
  );
};
