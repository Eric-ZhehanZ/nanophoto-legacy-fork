import zh from './ui-zh.json';
const translations: Record<string, string> = zh;
const lower = Object.fromEntries(Object.entries(zh).map(([k,v]) => [k.toLowerCase(),v]));
export function translateUi(text: string, language: 'en' | 'zh') {
  if (language !== 'zh') return text;
  const key = text.replace(/\s+/g, ' ').trim();
  return translations[key] || lower[key.toLowerCase()] || text;
}
