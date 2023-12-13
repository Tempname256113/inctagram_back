import { registerAs } from '@nestjs/config';

export default registerAs('APP_CONFIG', () => ({
  FIRST_APP_PORT: 3021 || process.env.PORT,
  SECOND_APP_PORT: 3022 || process.env.PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
}));
