import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync } from 'node:fs';
const [action, file] = process.argv.slice(2);
if (!['export', 'restore'].includes(action) || !file) {
  throw new Error('Usage: node scripts/postgres-transfer.mjs export|restore /private/path/photos.dump');
}
const connection = action === 'export'
  ? process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL
  : process.env.DATABASE_URL;
if (!connection) throw new Error('Set DATABASE_URL (and optionally DATABASE_URL_DIRECT for exports).');
if (action === 'export' && existsSync(file)) throw new Error('Refusing to overwrite an existing export.');
const url = new URL(connection);
const env = {
  ...process.env,
  PGHOST: url.hostname,
  PGPORT: url.port || '5432',
  PGUSER: decodeURIComponent(url.username),
  PGPASSWORD: decodeURIComponent(url.password),
  PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
  PGSSLMODE: url.searchParams.get('sslmode') || 'verify-full',
};
process.umask(0o077);
const args = action === 'export'
  ? ['--format=custom', '--no-owner', '--no-acl', '--file', file]
  : ['--no-owner', '--no-acl', '--exit-on-error', '--single-transaction', '--dbname', env.PGDATABASE, file];
const result = spawnSync(action === 'export' ? 'pg_dump' : 'pg_restore', args, { env, stdio: 'inherit' });
if (result.error) throw new Error('PostgreSQL client tools must be installed on PATH.');
if (result.status !== 0) process.exit(result.status || 1);
if (action === 'export') chmodSync(file, 0o600);
console.log(action === 'export' ? 'Export complete.' : 'Restore complete. Validate row counts before switching production.');
