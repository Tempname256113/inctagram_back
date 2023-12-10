import { registerAs } from '@nestjs/config';

export default registerAs('generalConfig', () => ({
  firstAppPort: parseInt(process.env.FIRST_APP_PORT) ?? 3001,
  secondAppPort: parseInt(process.env.SECOND_APP_PORT) ?? 3002,
}));
