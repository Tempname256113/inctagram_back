import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const LogoutRouteSwaggerDescription = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Logout' }),
    ApiOkResponse({ description: 'Logout success' }),
    ApiUnauthorizedResponse({
      description: 'Logout failed. Provide refresh token in cookies for logout',
    }),
    ApiCookieAuth(),
  );
};
