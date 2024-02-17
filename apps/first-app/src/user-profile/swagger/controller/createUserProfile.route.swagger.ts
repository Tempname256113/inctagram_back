import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileSwaggerType } from '../type/userProfile.swagger-type';

export const CreateUserProfileRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Create user profile`,
    }),
    ApiOkResponse({
      description: `User profile create successfully`,
      type: UserProfileSwaggerType,
    }),
    ApiBadRequestResponse({
      description: 'Something went wrong',
      schema: {
        example: {
          message: 'Username already exists',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiBearerAuth(),
  );
};
