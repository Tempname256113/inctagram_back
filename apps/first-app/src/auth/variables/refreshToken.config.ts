import { CookieOptions } from 'express';

export const refreshTokenCookieTitle = 'refreshToken';

export const getRefreshTokenCookieConfig = (expiresDate: Date) => {
  return {
    cookieTitle: refreshTokenCookieTitle,
    cookieOptions: {
      httpOnly: true,
      secure: true,
      expires: expiresDate,
      sameSite: 'none',
    } as CookieOptions,
  };
};
