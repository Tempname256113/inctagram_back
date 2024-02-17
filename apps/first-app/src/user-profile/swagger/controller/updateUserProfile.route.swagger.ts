import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileSwaggerType } from '../type/userProfile.swagger-type';

export const UpdateUserProfileRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Update user profile`,
    }),
    ApiOkResponse({
      description: `User profile update successfully`,
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
