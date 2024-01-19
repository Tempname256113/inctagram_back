import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const LogoutRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOkResponse({ description: 'Logout success' }),
    ApiUnauthorizedResponse({
      description: 'Logout failed. Provide refresh token in cookies for logout',
    }),
    ApiCookieAuth(),
  );
};
