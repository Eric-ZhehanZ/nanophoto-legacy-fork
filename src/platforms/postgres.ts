import { POSTGRES_SSL_ENABLED } from '@/app/config';
import { removeParamsFromUrl } from '@/utility/url';
import { Client, QueryResultRow } from 'pg';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export type Primitive = string | number | boolean | undefined | null;

export const query = async <T extends QueryResultRow = any>(
  queryString: string,
  values: Primitive[] = [],
) => {
  let hyperdrive: string | undefined;
  try { hyperdrive = getCloudflareContext().env.HYPERDRIVE?.connectionString; }
  catch { /* Plain Node.js development and portable self-hosting. */ }
  const connectionString = hyperdrive || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('Configure DATABASE_URL or POSTGRES_URL');
  const client = new Client({
    connectionString: hyperdrive ? hyperdrive : removeParamsFromUrl(connectionString, ['sslmode']),
    ...!hyperdrive && POSTGRES_SSL_ENABLED && { ssl: true },
    connectionTimeoutMillis: 10_000,
  });
  try {
    await client.connect();
    return await client.query<T>(queryString, values);
  } finally {
    await client.end();
  }
};

export const sql = <T extends QueryResultRow>(
  strings: TemplateStringsArray,
  ...values: Primitive[]
) => {
  if (!Array.isArray(strings) || !('raw' in strings)) {
    throw new Error('Invalid template literal argument');
  }
  let result = strings[0] ?? '';
  for (let i = 1; i < strings.length; i++) result += `$${i}${strings[i] ?? ''}`;
  return query<T>(result, values);
};
export const testDatabaseConnection = async () => query('SELECT 1');
