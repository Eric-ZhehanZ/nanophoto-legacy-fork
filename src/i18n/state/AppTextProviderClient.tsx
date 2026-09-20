'use client';

import { ReactNode } from 'react';
import { AppTextContext, AppLanguageContext, TagNamesContext } from './client';
import { I18N } from '..';
import { generateAppTextState } from '.';

export default function AppTextProviderClient({
  children,
  value,
  language,
  tagNames,
}: {
  children: ReactNode
  value: I18N
  language: 'en' | 'zh'
  tagNames: import('@/tag/catalog').TagNames[]
}) {
  return (
    <AppLanguageContext.Provider value={language}>
      <AppTextContext.Provider value={generateAppTextState(value)}>
        <TagNamesContext.Provider value={tagNames}>{children}</TagNamesContext.Provider>
      </AppTextContext.Provider>
    </AppLanguageContext.Provider>
  );
}
