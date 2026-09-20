'use client';

import { ReactNode } from 'react';
import { AppTextContext, AppLanguageContext } from './client';
import { I18N } from '..';
import { generateAppTextState } from '.';

export default function AppTextProviderClient({
  children,
  value,
  language,
}: {
  children: ReactNode
  value: I18N
  language: 'en' | 'zh'
}) {
  return (
    <AppLanguageContext.Provider value={language}>
      <AppTextContext.Provider value={generateAppTextState(value)}>
        {children}
      </AppTextContext.Provider>
    </AppLanguageContext.Provider>
  );
}
