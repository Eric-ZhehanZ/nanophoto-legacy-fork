'use client';
import { useUiText } from '@/i18n/UiText';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { PATH_ADMIN_TAGS } from '@/app/path';
import FieldsetWithStatus from '@/components/FieldsetWithStatus';
import SubmitButtonWithStatus from '@/components/SubmitButtonWithStatus';
import { TagNames } from '@/tag/catalog';
import { saveTagNamesAction, mergeTagsAction } from '@/tag/actions';
import { useAppLanguage } from '@/i18n/state/client';

export default function AdminTagForm({ tag, catalog, children }: {
  tag: string; catalog: TagNames[]; children?: ReactNode
}) {
  const uiText = useUiText();
  const zh = useAppLanguage() === 'zh';
  const entry = catalog.find(t => t.tag === tag);
  const [en, setEn] = useState(entry?.nameEn || tag.replaceAll('-', ' '));
  const [cn, setCn] = useState(entry?.nameZh || '');
  const [aliases, setAliases] = useState(entry?.aliases.join(', ') || '');
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');
  const action = (fn: (f: FormData) => Promise<unknown>) => async (f: FormData) => {
    try { await fn(f); } catch (e) {
      if (e instanceof Error && e.message === 'NEXT_REDIRECT') throw e;
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  return <div className="space-y-8">
    <p className="text-dim">{zh
      ? '同一标签共用一个固定链接，中英文名称仅用于显示。别名可用于选择标签和搜索。'
      : 'One tag, one permanent link. English and Chinese are display names. Aliases work in selection and search.'}</p>
    {error && <p role="alert">{error}</p>}
    <form action={action(saveTagNamesAction)} className="space-y-5">
      <input type="hidden" name="tag" value={tag} />
      <div className="grid grid-cols-2 gap-4">
        <FieldsetWithStatus id="nameEn" label={uiText('English')} value={en} onChange={setEn} required />
        <FieldsetWithStatus id="nameZh" label="中文" value={cn} onChange={setCn} required />
      </div>
      <FieldsetWithStatus id="aliases" label={zh ? '别名（逗号分隔）' : 'Aliases (comma separated)'} value={aliases} onChange={setAliases} />
      {children}
      <div className="flex gap-3">
        <Link className="button" href={PATH_ADMIN_TAGS}>{zh ? '取消' : 'Cancel'}</Link>
        <SubmitButtonWithStatus disabled={!en.trim() || !cn.trim()}>{zh ? '保存名称' : 'Save names'}</SubmitButtonWithStatus>
      </div>
    </form>
    <form action={action(mergeTagsAction)} className="space-y-4 border-t pt-5"
      onSubmit={e => { if (!confirm(zh ? '将此标签的所有照片移至所选标签，并保留旧名称为别名？' : 'Move all photos to the selected tag and preserve the old names as aliases?')) e.preventDefault(); }}>
      <input type="hidden" name="tag" value={tag} />
      <label className="block space-y-2">
        <span>{zh ? '合并到现有标签' : 'Merge into an existing tag'}</span>
        <select name="target" value={target} onChange={e => setTarget(e.target.value)} className="w-full">
          <option value="">{zh ? '选择标签' : 'Choose a tag'}</option>
          {catalog.filter(t => t.tag !== tag).map(t => <option key={t.tag} value={t.tag}>{t.nameEn} / {t.nameZh}</option>)}
        </select>
      </label>
      <SubmitButtonWithStatus disabled={!target}>{zh ? '合并标签' : 'Merge tags'}</SubmitButtonWithStatus>
    </form>
  </div>;
}
