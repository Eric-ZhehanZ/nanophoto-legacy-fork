import { cookies, headers } from 'next/headers';
import { cache } from 'react';

export const getRequestLanguage = cache(async (): Promise<'en' | 'zh'> => {
  const jar = await cookies();
  const value = jar.get('siteLanguage')?.value || jar.get('preferredLanguage')?.value;
  if (value === 'en' || value === 'zh') return value;
  const accepted = (await headers()).get('accept-language') || '';
  const first = accepted.split(',')[0]?.trim().toLowerCase();
  return first?.startsWith('zh') ? 'zh' : 'en';
});
export const getRequestLocale = async () => (await getRequestLanguage()) === 'zh' ? 'zh-cn' : 'en-us';
