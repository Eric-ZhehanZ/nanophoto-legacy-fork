import { query } from '@/platforms/postgres';
import { safelyQuery } from '@/db/query';
import { TagNames, resolveTagName } from './catalog';
import { parameterize } from '@/utility/string';
import { unstable_cache, revalidateTag } from 'next/cache';

export const getTagCatalog = async (): Promise<TagNames[]> =>
  safelyQuery(() => query(`SELECT tag, name_en AS "nameEn",
    name_zh AS "nameZh", aliases FROM photo_tags ORDER BY tag`)
    .then(r => r.rows), 'getTagCatalog');
// Only send names used by public photos to the public client provider.
export const getTagCatalogCached = unstable_cache(async (): Promise<TagNames[]> =>
  safelyQuery(() => query(`SELECT tag, name_en AS "nameEn",
    name_zh AS "nameZh", aliases FROM photo_tags t
    WHERE EXISTS (SELECT 1 FROM photos p
      WHERE p.hidden IS NOT TRUE AND t.tag=ANY(p.tags))
    ORDER BY tag`).then(r => r.rows), 'getPublicTagCatalog'),
  ['public-tag-names-v2'], { tags: ['tags'], revalidate: 3600 });

export async function canonicalizeTags(values: string[] = []) {
  const catalog = await getTagCatalog();
  const result: string[] = [];
  for (const value of values) {
    if (value === 'favs' || value === 'private') { result.push(value); continue; }
    const known = resolveTagName(value, catalog);
    if (known) { result.push(known.tag); continue; }
    const tag = parameterize(value);
    if (!tag) continue;
    await query(`INSERT INTO photo_tags(tag,name_en) VALUES($1,$2)
      ON CONFLICT DO NOTHING`, [tag, value.replaceAll('-', ' ')]);
    result.push(tag);
  }
  return [...new Set(result)];
}

export async function registerAiTags(
  values: string,
  labels: { tag: string; en: string; zh: string }[] = [],
) {
  const catalog = await getTagCatalog();
  const result: string[] = [];
  for (const value of values.split(',').map(t => t.trim()).filter(Boolean)) {
    const label = labels.find(l => l.tag === value);
    const known = resolveTagName(value, catalog) ||
      (label && (resolveTagName(label.en, catalog) ||
        resolveTagName(label.zh, catalog)));
    if (known) { result.push(known.tag); continue; }
    const tag = parameterize(value);
    if (!label?.en.trim() || !label.zh.trim() ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) ||
      tag === 'favs' || tag === 'private') continue;
    await query(`INSERT INTO photo_tags(tag,name_en,name_zh)
      VALUES($1,$2,$3) ON CONFLICT(tag) DO NOTHING`,
    [tag, label.en.trim(), label.zh.trim()]);
    catalog.push({ tag, nameEn: label.en, nameZh: label.zh, aliases: [] });
    result.push(tag);
  }
  revalidateTag('tags', 'max');
  return [...new Set(result)].join(', ');
}
