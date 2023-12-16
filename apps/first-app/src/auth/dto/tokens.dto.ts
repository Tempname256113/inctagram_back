export type AccessTokenPayloadType = {
  userId: number;
  iat?: number;
  exp?: number;
};

export type RefreshTokenPayloadType = {
  userId: number;
  iat?: number;
  exp?: number;
};
