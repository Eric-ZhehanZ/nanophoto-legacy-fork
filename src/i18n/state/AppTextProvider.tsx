import { ReactNode } from 'react';
import { getTagCatalogCached } from '@/tag/catalog-server';
import { getTextForLocale } from '..';
import { getRequestLocale } from '../request';
import AppTextProviderClient from './AppTextProviderClient';

export default async function AppTextProvider({
  children,
}: {
  children: ReactNode
}) {
  const tagNames = await getTagCatalogCached();
  const locale = await getRequestLocale();
  const language = locale === 'zh-cn' ? 'zh' : 'en';
  const value = await getTextForLocale(locale);
  return (
    <AppTextProviderClient {...{ value, language, tagNames }}>
      {children}
    </AppTextProviderClient>
  );
}
