import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserProfileSwaggerType } from '../type/userProfile.swagger-type';

export const GetUserProfileRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Get user profile`,
    }),
    ApiOkResponse({
      description: `User profile found successfully`,
      type: UserProfileSwaggerType,
    }),
    ApiBadRequestResponse({
      description: 'Something went wrong',
      schema: {
        example: {
          message: 'Something went wrong',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiBearerAuth(),
  );
};
