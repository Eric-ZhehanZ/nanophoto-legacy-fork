'use client';

import { useRouter } from 'next/navigation';
import { useAppLanguage } from '@/i18n/state/client';
import Switcher from '@/components/switcher/Switcher';
import SwitcherItem from '@/components/switcher/SwitcherItem';

export default function LanguageSwitcher() {
  const router = useRouter();
  const language = useAppLanguage();
  const next = language === 'en' ? 'zh' : 'en';

  return <Switcher>
    <SwitcherItem
      active
      icon={<span className="text-xs leading-none">{next === 'zh' ? '中文' : 'EN'}</span>}
      tooltip={{ content: next === 'zh' ? '切换为中文' : 'Switch to English' }}
      onClick={() => {
        window.SitePreferences?.setLanguage(next);
        document.documentElement.lang = next === 'zh' ? 'zh-Hans' : 'en';
        router.refresh();
      }}
    />
  </Switcher>;
}
