import useScrollDirection from '@/utility/useScrollDirection';
import clsx from 'clsx/lite';
import { RefObject, useMemo } from 'react';

export default function useStickyNav(
  ref: RefObject<HTMLElement | null>,
  isEnabled = true,
) {
  const { scrollDirection, scrollY } = useScrollDirection();

  const navHeight = ref.current?.clientHeight ?? 0;

  const hasScrolledPastNav = scrollY > navHeight;

  const isNavSticky = isEnabled;
  const shouldHideStickyNav = isEnabled && hasScrolledPastNav &&
    scrollDirection === 'down';

  const classNames = useMemo(() => ({
    classNameStickyContainer: clsx(
      isNavSticky && 'photo-nav-motion sticky top-0 z-10 pointer-events-none',
      shouldHideStickyNav && 'photo-nav-hidden',
    ),
    classNameStickyNav: '',
  }), [isNavSticky, shouldHideStickyNav]);

  return {
    ...classNames,
    isNavVisible: !shouldHideStickyNav,
  };
};
