'use client';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    SitePreferences?: {
      theme(): string;
      language(): 'en' | 'zh';
      setTheme(value: string): void;
      setLanguage(value: string): void;
    };
  }
}
export default function SitePreferences({ language }: { language: 'en' | 'zh' }) {
  const { setTheme } = useTheme();
  const router = useRouter();
  useEffect(() => {
    const sync = () => {
      const shared = window.SitePreferences;
      if (!shared) return;
      setTheme(shared.theme());
      if (shared.language() !== language) router.refresh();
    };
    sync();
    window.addEventListener('site-preferences', sync);
    return () => window.removeEventListener('site-preferences', sync);
  }, [language, router, setTheme]);
  return null;
}
