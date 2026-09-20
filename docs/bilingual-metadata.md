# Bilingual metadata and tags

English remains in `photos.title`, `caption`, and `semantic_description`.
Simplified Chinese uses the matching `_zh` columns. Missing translations fall
back to English per field. Localized display objects must never be persisted.

`photo_tags.tag` is the permanent ID used in `photos.tags` and URLs. `name_en`
and `name_zh` are display names; `aliases` is a PostgreSQL text array used for
selection, search, and resolving merged URLs. The admin tag editor changes
names without changing IDs. Merge moves memberships and preserves source
names as aliases in one SQL statement. Reserved `favs`/`private` tags cannot
be merged or renamed through this editor.

Migration 12 in `src/db/migration.ts` is additive and idempotent. Export the
database using `scripts/postgres-transfer.mjs` before migrating. All columns,
arrays, and tables use standard PostgreSQL and are included by pg_dump.

AI generation uses one authenticated structured request for both languages.
Existing tag IDs, names, and aliases are supplied before generation. Known
names resolve to existing IDs; new AI tags require both language names.
Catalog and photo caches are invalidated after changes.

The initial translation backfill preserved existing English metadata and
photo files. Singular/plural duplicates backpack/backpacks, bird/birds, and
tree/trees were consolidated; original names remain as aliases.
