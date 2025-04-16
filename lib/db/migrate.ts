import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  console.log('🔗 Using POSTGRES_URL:', process.env.POSTGRES_URL!.replace(/:([^\/]+)@/, ':***@'));

  const connection = postgres(process.env.POSTGRES_URL!, { 
    ssl: 'require',
    max: 1,
    idle_timeout: 5
  });
  const db = drizzle(connection);

  console.log('⏳ Running migrations...');
  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  console.log('✅ Migrations completed in', Date.now() - start, 'ms');
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
