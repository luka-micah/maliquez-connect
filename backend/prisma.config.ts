import { defineConfig, env } from '@prisma/config';
import { config } from 'dotenv';

config();

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DB_URL'),
  },
});
