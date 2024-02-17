import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SideAuthResponseTypeSwagger } from '../../../dto/response/sideAuth.responseType';

export const SideAuthRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Auth via side decisions' }),
    ApiOkResponse({
      description: 'Successful login/registration',
      type: SideAuthResponseTypeSwagger,
    }),
    ApiBadRequestResponse({
      description: 'Provided incorrect auth code',
    }),
    ApiUnauthorizedResponse({
      description: 'Provided invalid auth code',
    }),
  );
};
