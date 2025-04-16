import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export async function runMigrations() {
  const sql = postgres(process.env.POSTGRES_URL!);
  await migrate(drizzle(sql), { 
    migrationsFolder: './lib/db/migrations' 
  });
}

runMigrations().catch(console.error);
