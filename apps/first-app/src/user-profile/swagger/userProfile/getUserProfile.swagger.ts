import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserProfileSwaggerType } from '../type/userProfile.swagger-type';

export const GetUserProfileSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Get user profile`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `User profile found successfully`,
      type: UserProfileSwaggerType,
    }),
    ApiResponse({
      description: 'Something went wrong',
      status: HttpStatus.BAD_REQUEST,
      schema: {
        example: {
          message: 'Something went wrong',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
  );
};
