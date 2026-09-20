import { getAiImageQuerySchema } from '@/photo/ai';
import { resolveTagName } from '@/tag/catalog';
import { localizePhoto } from '@/photo/localize';
import { Photo } from '@/photo';
import { convertPhotoToFormData, convertFormDataToPhotoDbInsert } from '@/photo/form';
import { translateUi } from '@/i18n/ui';

const catalog = [{ tag: 'tree', nameEn: 'Tree', nameZh: '树木', aliases: ['trees', 'arboreal'] }];
it('resolves both languages and synonyms to the same stable tag', () => {
  for (const name of ['Tree', '树木', 'trees', ' ARBOREAL ']) {
    expect(resolveTagName(name, catalog)?.tag).toBe('tree');
  }
  expect(resolveTagName('train', catalog)).toBeUndefined();
});
it('requires paired AI fields and includes the existing bilingual catalog', () => {
  const { schema, query } = getAiImageQuerySchema(['title','tags','semantic'], undefined,
    catalog.map(t => ({ ...t, count: 1, lastModified: new Date() })));
  expect(query).toContain('REUSE EXISTING TAG IDs first');
  expect(query).toContain('arboreal');
  expect(query).toContain('树木');
  expect(schema.safeParse({ title: 'Trees', semantic: 'Sunlit trees', tags: 'tree' }).success).toBe(false);
  expect(schema.safeParse({ title: 'Trees', titleZh: '树木', semantic: 'Sunlit trees',
    semanticZh: '阳光下的树木', tags: 'tree', tagLabels: [{ tag: 'tree', en: 'Tree', zh: '树木' }] }).success).toBe(true);
});
it('localizes display without mutating the English source and falls back per field', () => {
  const original = { title: 'Trees', titleZh: '树木', caption: 'Sunshine',
    semanticDescription: 'Sunlit trees', semanticDescriptionZh: '阳光下的树木' } as Photo;
  const localized = localizePhoto(original, 'zh');
  expect(localized.title).toBe('树木');
  expect(localized.caption).toBe('Sunshine');
  expect(localized.semanticDescription).toBe('阳光下的树木');
  expect(original.title).toBe('Trees');
  expect(localizePhoto(original, 'en')).toBe(original);
});
it('round trips both languages without changing canonical tag identity', () => {
  const photo = { id:'abcdefgh', title:'Trees', titleZh:'树木', caption:'Light', captionZh:'光',
    semanticDescription:'Sunlit trees', semanticDescriptionZh:'阳光下的树木', tags:['tree'],
    takenAt:new Date(), createdAt:new Date(), updatedAt:new Date(), takenAtNaive:'2026-01-01',
    aspectRatio:1.5 } as Photo;
  const insert = convertFormDataToPhotoDbInsert(convertPhotoToFormData(photo));
  expect(insert).toMatchObject({ title:'Trees', titleZh:'树木', captionZh:'光',
    semanticDescriptionZh:'阳光下的树木', tags:['tree'] });
});
it('translates UI labels without translating English mode or unknown user text', () => {
  expect(translateUi('Photo Details','zh')).toBe('照片详情');
  expect(translateUi('Photo Details','en')).toBe('Photo Details');
  expect(translateUi('My unique title','zh')).toBe('My unique title');
});
