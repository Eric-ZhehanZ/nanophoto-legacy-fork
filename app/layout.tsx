import { clsx } from 'clsx/lite';
import {
  BASE_URL,
  PRESERVE_ORIGINAL_UPLOADS,
  META_DESCRIPTION,
  META_TITLE,
  SITE_FEEDS_ENABLED,
  ADMIN_DEBUG_TOOLS_ENABLED,
  ADMIN_AI_MODEL_DEBUG_ENABLED,
  PAGE_SCRIPT_URLS,
  GIT_COMMIT_SHA_SHORT,
  DEBUG_OUTPUTS_ENABLED,
} from '@/app/config';
import AppStateProvider from '@/app/AppStateProvider';
import ToasterWithThemes from '@/toast/ToasterWithThemes';
import PhotoEscapeHandler from '@/photo/PhotoEscapeHandler';
import { Metadata } from 'next/types';
import { ThemeProvider } from 'next-themes';
import Nav from '@/app/Nav';
import Footer from '@/app/Footer';
import CommandK from '@/cmdk/CommandK';
import SwrConfigClient from '@/swr/SwrConfigClient';
import ShareModals from '@/share/ShareModals';
import AdminUploadPanel from '@/admin/upload/AdminUploadPanel';
import { revalidatePath } from 'next/cache';
import RecipeModal from '@/recipe/RecipeModal';
import ThemeColors from '@/app/ThemeColors';
import AppTextProvider from '@/i18n/state/AppTextProvider';
import SharedHoverProvider from '@/components/shared-hover/SharedHoverProvider';
import { PATH_FEED_JSON, PATH_RSS_XML } from '@/app/path';
import SelectPhotosProvider from '@/admin/select/SelectPhotosProvider';
import AdminBatchEditPanel from '@/admin/select/AdminBatchEditPanel';
import EditTitlesProvider from '@/admin/edit-titles/EditTitlesProvider';
import AdminEditTitlesPanel from '@/admin/edit-titles/AdminEditTitlesPanel';
import Script from 'next/script';

import '../tailwind.css';
import { getRequestLanguage } from '@/i18n/request';
import SitePreferences from '@/app/SitePreferences';

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  ...BASE_URL && { metadataBase: new URL(BASE_URL) },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
  twitter: {
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/favicons/light.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
      { url: '/favicons/dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
  ...DEBUG_OUTPUTS_ENABLED && {
    other: {
      'build': GIT_COMMIT_SHA_SHORT ?? 'unknown',
    },
  },
  ...SITE_FEEDS_ENABLED && {
    alternates: {
      types: {
        'application/rss+xml': PATH_RSS_XML,
        'application/json': PATH_FEED_JSON,
      },
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const language = await getRequestLanguage();
  return (
    <html
      lang={language === 'zh' ? 'zh-Hans' : 'en'}
      // Suppress hydration errors due to next-themes behavior
      suppressHydrationWarning
    >
      <head>
        {/* Import the shared cookie before next-themes and the first paint. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/site-preferences.js" data-cfasync="false" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={clsx(
        // Center on large screens
        '3xl:flex flex-col items-center',
      )}>
        <AppStateProvider
          areAdminDebugToolsEnabled={ADMIN_DEBUG_TOOLS_ENABLED}
          isAdminAiModelDebugEnabled={ADMIN_AI_MODEL_DEBUG_ENABLED}
        >
          <AppTextProvider>
            <SelectPhotosProvider>
              <EditTitlesProvider>
                <ThemeColors />
                <ThemeProvider attribute="class" defaultTheme="system">
                  <SitePreferences language={language} />
                  <SwrConfigClient>
                    <SharedHoverProvider>
                      <div className={clsx(
                        'mx-3 mb-3',
                        'lg:mx-6 lg:mb-6',
                      )}>
                        <Nav />
                        <main>
                          <ShareModals />
                          <RecipeModal />
                          <div className={clsx(
                            'min-h-[16rem] sm:min-h-[30rem]',
                            'mb-12',
                            'space-y-5',
                          )}>
                            <AdminUploadPanel
                              shouldResize={!PRESERVE_ORIGINAL_UPLOADS}
                              onLastUpload={async () => {
                                'use server';
                                // Update upload count in admin nav
                                revalidatePath('/admin', 'layout');
                              }}
                            />
                            <AdminBatchEditPanel
                              onBatchActionComplete={async () => {
                                'use server';
                                // Update upload count in admin nav
                                revalidatePath('/admin', 'layout');
                              }}
                            />
                            <AdminEditTitlesPanel />
                            {children}
                          </div>
                        </main>
                        <Footer />
                      </div>
                      <CommandK />
                    </SharedHoverProvider>
                  </SwrConfigClient>
                  <PhotoEscapeHandler />
                  <ToasterWithThemes />
                </ThemeProvider>
              </EditTitlesProvider>
            </SelectPhotosProvider>
          </AppTextProvider>
        </AppStateProvider>
        {PAGE_SCRIPT_URLS.map(url => <Script key={url} src={url} />)}
      </body>
    </html>
  );
}
