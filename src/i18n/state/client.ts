'use client';

import { createContext, use, useCallback } from 'react';
import { generateAppTextState } from '.';
import { TEXT as EN_US } from '../locales/en-us';

export const AppTextContext = createContext(generateAppTextState(EN_US));

export const useAppText = () => use(AppTextContext);

export const AppLanguageContext = createContext<'en' | 'zh'>('en');
export const useAppLanguage = () => use(AppLanguageContext);
export const TagNamesContext = createContext<import('@/tag/catalog').TagNames[]>([]);
export const useTagNames = () => {
  const catalog = use(TagNamesContext);
  const language = useAppLanguage();
  return useCallback((tag: string) => {
    const entry = catalog.find(t => t.tag === tag || t.aliases.includes(tag));
    return (language === 'zh' ? entry?.nameZh : entry?.nameEn) ||
      entry?.nameEn || tag.replaceAll('-', ' ');
  }, [catalog, language]);
};
