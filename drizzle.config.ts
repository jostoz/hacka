import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

config({
  path: '.env.local',
});

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
} satisfies Config;
