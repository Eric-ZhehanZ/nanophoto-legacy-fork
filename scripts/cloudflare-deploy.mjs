import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
// OpenNext's cache-population subprocess also needs the account selection.
const result = spawnSync('pnpm', ['exec', 'opennextjs-cloudflare', 'deploy'], {
  stdio: 'inherit',
  env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || config.account_id },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
