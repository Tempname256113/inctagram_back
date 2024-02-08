import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserProfileSwaggerType } from '../type/userProfile.swagger-type';

export const UpdateUserProfileSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Update user profile`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `User profile update successfully`,
      type: UserProfileSwaggerType,
    }),
    ApiResponse({
      description: 'Something went wrong',
      status: HttpStatus.BAD_REQUEST,
      schema: {
        example: {
          message: 'Username already exists',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
  );
};
