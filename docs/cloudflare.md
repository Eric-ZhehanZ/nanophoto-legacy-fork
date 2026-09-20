# Cloudflare deployment and database portability

The photo blog runs on Cloudflare Workers through OpenNext. Photos are stored in R2 and responsive images use Cloudflare zone resizing directly on the R2 public domain. Upload processing uses the Cloudflare Images binding. No Vercel account, SDK, deployment, image optimizer, Blob store, or AI Gateway is required at runtime. `vercel.json` only disables the retired Git deployment integration, so pushing this migration cannot replace the previous Vercel deployment.

## Services

- Worker: `nanophoto`; public hostname: `photos.zhehanz.com`.
- Originals: R2 bucket `nanophoto`, served at `photos-cdn.zhehanz.com`.
- Next data cache: separate private R2 bucket `nanophoto-cache`.
- Cache invalidation and revalidation: SQLite Durable Objects.
- Database: any PostgreSQL provider using `DATABASE_URL`; `POSTGRES_URL` remains an optional compatibility alias. Optional Hyperdrive binding is also supported.
- Authentication: existing `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
- Optional AI: direct OpenAI-compatible endpoint, configured with `OPENAI_SECRET_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL`.

Cloudflare zone Pro and Workers Paid are separate plans. The application requires Workers Paid for its bundle size and CPU allowance; the Worker has an explicit 30-second CPU ceiling. Images usage and R2 usage follow their respective account plans.

## Local development and deployment

Use Node 22 or newer and pnpm. Install with `pnpm install --frozen-lockfile`.

Public settings live in `wrangler.jsonc`. Next.js compiles `NEXT_PUBLIC_*` values into browser assets, so provide matching values in an ignored `.env.production.local` when building. Keep private values in `.dev.vars` for the local Workers preview and Cloudflare Worker secrets in production. Never commit connection strings, credentials, `.dev.vars`, `.env*`, or database exports.

Required private values:

```
DATABASE_URL
AUTH_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
CLOUDFLARE_R2_ACCESS_KEY
CLOUDFLARE_R2_SECRET_ACCESS_KEY
```

`pnpm build:cloudflare` builds the deployment. `pnpm preview:cloudflare` runs the actual Workers runtime locally. `pnpm deploy:cloudflare` builds and deploys. A normal `next dev` process alone does not test Workers runtime compatibility.

Create `nanophoto-cache` once with Wrangler. Upload runtime secrets using `wrangler secret bulk` and a private JSON file containing only the required application secrets. Do not transfer Vercel platform tokens or the retired Blob token.

Before a public cutover, test the workers.dev deployment: image thumbnails, original download, photo detail, albums, feed, library, sign-in, authenticated upload, EXIF/GPS handling, editing and cache invalidation. R2 CORS must permit the public photo origin for direct uploads. Attach the custom domain only after these checks.

## Moving PostgreSQL providers

The database uses ordinary PostgreSQL tables, indexes, arrays, and JSONB. It has no Vercel-specific database API. The schema/migration code remains in `src/db` and the query code uses parameterized `pg` queries.

1. Pause writes/uploads while taking the final export and switching providers.
2. Set `DATABASE_URL_DIRECT` to the source provider's direct PostgreSQL connection (or use `DATABASE_URL`), then run `node scripts/postgres-transfer.mjs export /private/path/photos.dump`.
3. Create an empty database in your chosen provider and region. With its connection in `DATABASE_URL`, run `node scripts/postgres-transfer.mjs restore /private/path/photos.dump`. Restore deliberately does not drop or overwrite existing tables.
4. Compare table row counts, validate photos, albums and library settings, and test sign-in/upload/editing in a preview.
5. Replace the Worker's `DATABASE_URL` secret, clear/revalidate cached data, and deploy. Retain the old database until the replacement is verified.

Exports and restores use standard `pg_dump`/`pg_restore`; install PostgreSQL client tools on your PATH. The transfer script passes credentials through the child process environment, not command-line arguments. Exports contain private content and must be stored securely.

Keeping an existing Neon project connected directly does not change its account ownership or billing. If that project was created through Vercel's marketplace, verify independent Neon account access or export into a directly owned Neon project before deleting the marketplace integration. Deleting an integration may delete its database.

## Appearance and language

Both sites use non-sensitive parent-domain cookies `siteAppearance` (`light`, `dark`, `system`) and `siteLanguage` (`en`, `zh`). `system` remains a preference, rather than being replaced with the device's currently resolved color. The scripts also synchronize tabs when focus returns. Cross-domain aliases pass only validated appearance/language query parameters.

The canonical shared script is `public/site-preferences.js`; keep it identical to Kirby's `assets/js/site-preferences.js`. Navigation fades respect reduced-motion preferences. Language-dependent HTML is rendered per request; database query caches are shared independently of the visitor's language.

## Rollback

Keep the previous production deployment, database export, and verified media manifest until the Cloudflare cutover is proven. Copies in R2 do not delete original Blob files. If needed, return the DNS record to its recorded previous value. A media URL rollback must use the saved old/new URL manifest and a transaction, without touching photo IDs, EXIF, album membership, or timestamps.
