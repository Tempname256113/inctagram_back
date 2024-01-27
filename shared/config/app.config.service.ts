import { registerAs } from '@nestjs/config';

export default registerAs('APP_CONFIG', () => ({
  FIRST_APP_PORT: parseInt(process.env.FIRST_APP_PORT) || 3021,
  SECOND_APP_PORT: parseInt(process.env.SECOND_APP_PORT) || 3022,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
}));
