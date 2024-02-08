import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserProfileSwaggerType } from '../type/userProfile.swagger-type';

export const CreateUserProfileSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: `Create user profile`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: `User profile create successfully`,
      type: [UserProfileSwaggerType],
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
