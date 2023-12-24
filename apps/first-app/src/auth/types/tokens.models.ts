export type AccessTokenPayloadType = {
  userId: number;
  iat?: number;
  exp?: number;
};

export type RefreshTokenPayloadType = {
  userId: number;
  uuid: string;
  iat?: number;
  exp?: number;
};
