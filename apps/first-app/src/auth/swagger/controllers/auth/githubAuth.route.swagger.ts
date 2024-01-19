import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GithubAuthReturnUserInfoTypeSwagger } from '../../dto/githubAuth.returnUserInfoType.swagger';
import { GithubAuthDtoSwagger } from '../../dto/githubAuth.dto.swagger';

export const GithubAuthRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOkResponse({
      description: 'Successful login/registration',
      type: GithubAuthReturnUserInfoTypeSwagger,
    }),
    ApiBadRequestResponse({ description: 'Provide correct github auth code' }),
    ApiUnauthorizedResponse({
      description: 'Provided invalid github auth code',
    }),
    ApiBody({ type: GithubAuthDtoSwagger, required: true }),
  );
};
