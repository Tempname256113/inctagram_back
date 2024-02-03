import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SideAuthDtoSwagger } from '../../../dto/sideAuth.dto';
import { SideAuthResponseTypeSwagger } from '../../../dto/response/sideAuth.responseType';

export const SideAuthRouteSwaggerDescription = () => {
  return applyDecorators(
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
    ApiBody({ type: SideAuthDtoSwagger, required: true }),
  );
};
