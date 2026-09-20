'use server';
import { runAuthenticatedAdminServerAction } from '@/auth/server';
import { query } from '@/platforms/postgres';
import { getTagCatalog } from './catalog-server';
import { normalizeTagName } from './catalog';
import { revalidateAllKeysAndPaths } from '@/cache';
import { redirect } from 'next/navigation';
import { PATH_ADMIN_TAGS } from '@/app/path';

export async function saveTagNamesAction(form: FormData) {
  return runAuthenticatedAdminServerAction(async () => {
    const tag = String(form.get('tag') || '');
    const nameEn = String(form.get('nameEn') || '').trim();
    const nameZh = String(form.get('nameZh') || '').trim();
    const aliases = String(form.get('aliases') || '').split(/[,，]/)
      .map(t => t.trim()).filter(Boolean);
    if (!tag || ['favs', 'private'].includes(tag) || !nameEn ||
      !nameZh || nameEn.length > 100 || nameZh.length > 100 || aliases.length > 50) {
      throw new Error('Both English and Chinese tag names are required / 请填写中英文标签名称');
    }
    const catalog = await getTagCatalog();
    const names = [tag, nameEn, nameZh, ...aliases].map(normalizeTagName);
    if (catalog.some(t => t.tag !== tag && [t.tag, t.nameEn, t.nameZh, ...t.aliases]
      .some(n => n && names.includes(normalizeTagName(n))))) {
      throw new Error('This name belongs to another tag. Merge them instead / 此名称已属于其他标签，请合并标签');
    }
    await query(`INSERT INTO photo_tags(tag,name_en,name_zh,aliases)
      VALUES($1,$2,$3,ARRAY(SELECT jsonb_array_elements_text($4::jsonb))) ON CONFLICT(tag) DO UPDATE
      SET name_en=$2,name_zh=$3,aliases=ARRAY(SELECT jsonb_array_elements_text($4::jsonb))`,
    [tag, nameEn, nameZh, JSON.stringify([...new Set(aliases)])]);
    revalidateAllKeysAndPaths();
    redirect(PATH_ADMIN_TAGS);
  });
}

export async function mergeTagsAction(form: FormData) {
  return runAuthenticatedAdminServerAction(async () => {
    const source = String(form.get('tag') || '');
    const target = String(form.get('target') || '');
    const catalog = await getTagCatalog();
    if (source === target || !catalog.some(t => t.tag === source) ||
      !catalog.some(t => t.tag === target) ||
      [source,target].some(t => ['favs','private'].includes(t))) {
      throw new Error('Choose two different tags / 请选择两个不同标签');
    }
    // One PostgreSQL statement: move memberships and keep old names as aliases.
    await query(`WITH source AS (
      DELETE FROM photo_tags WHERE tag=$1 RETURNING *
    ), moved AS (
      UPDATE photos SET tags=ARRAY(SELECT DISTINCT CASE WHEN t=$1 THEN $2 ELSE t END
        FROM unnest(tags) t), updated_at=NOW() WHERE $1=ANY(tags) RETURNING id
    ) UPDATE photo_tags SET aliases=ARRAY(SELECT DISTINCT a FROM unnest(
      aliases || (SELECT aliases || ARRAY[tag,name_en,name_zh] FROM source)) a
      WHERE a <> '') WHERE tag=$2`, [source,target]);
    revalidateAllKeysAndPaths();
    redirect(PATH_ADMIN_TAGS);
  });
}
