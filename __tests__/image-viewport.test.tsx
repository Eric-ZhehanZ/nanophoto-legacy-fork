import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import ImageViewport from '@/components/image/ImageViewport';

it('unmounts distant image trees and restores them when scrolling back', async () => {
  let notify: IntersectionObserverCallback;
  const elements: Element[] = [];
  const unobserve = jest.fn();
  const disconnect = jest.fn();
  const original = window.IntersectionObserver;
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  window.IntersectionObserver = jest.fn().mockImplementation(callback => {
    notify = callback;
    return { observe: (element: Element) => elements.push(element), unobserve, disconnect };
  });
  const container = document.createElement('div');
  const root = createRoot(container);
  try {
    await act(async () => root.render(createElement('div', {},
      ...Array.from({ length: 40 }, (_, i) => createElement(ImageViewport, {
        key: i, placeholder: createElement('span', {}, 'reserved space'),
      }, createElement('img', { src: `photo-${i}.jpg`, alt: 'photo' }))),
    )));
    expect(container.querySelectorAll('img')).toHaveLength(0);
    await act(async () => notify!(elements.map((target, i) => ({
      target, isIntersecting: i < 3,
    })) as IntersectionObserverEntry[], {} as IntersectionObserver));
    expect(container.querySelectorAll('img')).toHaveLength(3);
    await act(async () => notify!(elements.map((target, i) => ({
      target, isIntersecting: i >= 37,
    })) as IntersectionObserverEntry[], {} as IntersectionObserver));
    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('photo-37.jpg');
    await act(async () => notify!(elements.map((target, i) => ({
      target, isIntersecting: i === 0,
    })) as IntersectionObserverEntry[], {} as IntersectionObserver));
    expect(container.querySelector('img')?.getAttribute('src')).toBe('photo-0.jpg');
  } finally {
    await act(async () => root.unmount());
    window.IntersectionObserver = original;
  }
  expect(unobserve).toHaveBeenCalledTimes(40);
  expect(disconnect).toHaveBeenCalledTimes(1);
});
