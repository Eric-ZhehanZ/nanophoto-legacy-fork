'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

// Share one observer across gallery thumbnails. Keep a generous prefetch
// margin, but release image elements and compositor layers far off screen.
const listeners = new Map<Element, (visible: boolean) => void>();
let observer: IntersectionObserver | undefined;

export default function ImageViewport({ children, placeholder, eager = false }: {
  children: ReactNode
  placeholder: ReactNode
  eager?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      // Older browsers retain native lazy loading.
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }
    observer ??= new IntersectionObserver(entries => {
      for (const entry of entries) {
        listeners.get(entry.target)?.(entry.isIntersecting);
      }
    }, { rootMargin: '1000px 0px' });
    listeners.set(element, setVisible);
    observer.observe(element);
    return () => {
      observer?.unobserve(element);
      listeners.delete(element);
      if (!listeners.size) { observer?.disconnect(); observer = undefined; }
    };
  }, []);
  return <div ref={ref} className="contents-image" style={{ display: 'grid' }}
    data-image-active={visible ? 'true' : 'false'}>
    {visible ? children : placeholder}
  </div>;
}
