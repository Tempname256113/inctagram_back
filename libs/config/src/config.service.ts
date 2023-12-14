import { registerAs } from '@nestjs/config';

export default registerAs('APP_CONFIG', () => ({
  FIRST_APP_PORT: parseInt(process.env.FIRST_APP_PORT) || 3021,
  SECOND_APP_PORT: parseInt(process.env.SECOND_APP_PORT) || 3022,
}));
