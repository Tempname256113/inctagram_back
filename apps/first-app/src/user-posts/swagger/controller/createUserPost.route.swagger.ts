import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserPostReturnType } from '../../application/createPost.handler';

export const CreateUserPostRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create user post' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          files: {
            type: 'string',
            format: 'binary',
            description:
              'Few images for new post. Min - 1 image, max - 10 images',
          },
          description: {
            type: 'string',
            description: 'New post description. Optional value',
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: 'New post created',
      type: CreateUserPostReturnType,
    }),
    ApiUnauthorizedResponse({
      description: 'You must provide valid access token to access this route',
    }),
  );
};
