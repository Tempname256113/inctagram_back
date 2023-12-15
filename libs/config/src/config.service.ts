import { registerAs } from '@nestjs/config';

export default registerAs('APP_CONFIG', () => ({
  FIRST_APP_PORT: parseInt(process.env.PORT) || 3021,
  SECOND_APP_PORT: parseInt(process.env.PORT) || 3022,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
}));
