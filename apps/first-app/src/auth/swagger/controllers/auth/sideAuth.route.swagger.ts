import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SideAuthReturnUserInfoTypeSwagger } from '../../dto/sideAuth.returnUserInfoType.swagger';
import { SideAuthResponseDtoSwagger } from '../../dto/sideAuthResponse.dto.swagger';

export const SideAuthRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Successful login/registration',
      type: SideAuthReturnUserInfoTypeSwagger,
    }),
    ApiBadRequestResponse({
      description: 'Provided incorrect auth code',
    }),
    ApiUnauthorizedResponse({
      description: 'Provided invalid auth code',
    }),
    ApiBody({ type: SideAuthResponseDtoSwagger, required: true }),
  );
};
