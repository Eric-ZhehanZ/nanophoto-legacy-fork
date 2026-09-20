import { readFileSync } from 'node:fs';
import { Client } from 'pg';
const connection = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connection) throw new Error('Set DATABASE_URL');
const url = new URL(connection);
url.searchParams.delete('sslmode');
const client = new Client({ connectionString: url.toString(),
  ssl: process.env.DISABLE_POSTGRES_SSL === '1' ? false : true });
await client.connect();
try {
  const source = readFileSync(new URL('../src/db/migration.ts', import.meta.url), 'utf8');
  const migration = source.match(/label: '12:[\s\S]*?run: \(\) => query\(`([\s\S]*?)`\)/)?.[1];
  if (!migration) throw new Error('Bilingual migration not found');
  await client.query('BEGIN');
  await client.query(migration);
  await client.query('COMMIT');
  console.log('Bilingual metadata schema ready; existing metadata preserved.');
} catch (error) { await client.query('ROLLBACK'); throw error; }
finally { await client.end(); }
