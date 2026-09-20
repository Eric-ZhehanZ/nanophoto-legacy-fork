'use client';

import { clsx } from 'clsx/lite';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import AppGrid from '../components/AppGrid';
import AppToolbar from '@/app/AppToolbar';
import {
  isPathAdmin,
  isPathSignIn,
} from '@/app/path';
import { useRef } from 'react';
import useStickyNav from './useStickyNav';
import { useAppState } from '@/app/AppState';
import './photo-nav.css';

const NAV_HEIGHT_CLASS = 'min-h-[4rem]';

export default function NavClient({
  navTitle,
  isInEmptyState,
}: {
  navTitle: string
  isInEmptyState: boolean
}) {
  const ref = useRef<HTMLElement>(null);

  const pathname = usePathname();
  const showNav = !isPathSignIn(pathname);

  const {
    hasLoadedWithAnimations,
  } = useAppState();

  const {
    classNameStickyContainer,
    classNameStickyNav,
    isNavVisible,
  } = useStickyNav(ref, !isPathAdmin(pathname));

  return (
    <AppGrid
      className={classNameStickyContainer}
      classNameMain='pointer-events-auto'
      contentMain={
        showNav && <nav
          ref={ref}
          className={clsx(
            'photo-nav w-full flex items-center gap-1.5 sm:gap-2 bg-main',
            NAV_HEIGHT_CLASS,
            // Enlarge nav to ensure it fully masks underlying content
            'md:w-[calc(100%+8px)] md:translate-x-[-4px] md:px-[4px]',
            classNameStickyNav,
          )}>
          <AppToolbar
            animate={hasLoadedWithAnimations && isNavVisible}
            hideSortControl={isInEmptyState}
          />
          <div className="grow flex justify-end min-w-0">
            <a href="https://zhehanz.com/" aria-label={navTitle} className="group">
              <span className="block relative w-16 h-12">
                <Image src="/logo-light.svg" alt="ZhehanZ"
                  width={64} height={48} unoptimized priority
                  className="absolute inset-0 size-full opacity-50 group-hover:opacity-100 block dark:hidden"
                />
                <Image src="/logo-dark.svg" alt="ZhehanZ"
                  width={64} height={48} unoptimized priority
                  className="absolute inset-0 size-full opacity-75 group-hover:opacity-100 hidden dark:block"
                />
              </span>
            </a>
          </div>
        </nav>
      }
    />
  );
};
