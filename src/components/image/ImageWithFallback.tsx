'use client';

/* eslint-disable jsx-a11y/alt-text */
import ImageViewport from './ImageViewport';
import cloudflareImageLoader from '@/platforms/cloudflare-image-loader';
import { BLUR_ENABLED } from '@/app/config';
import { useAppState } from '@/app/AppState';
import { clsx}  from 'clsx/lite';
import Image, { ImageProps } from 'next/image';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

function ImageWithFallbackInner({
  ref: refProp,
  className,
  classNameImage = 'object-cover h-full',
  blurDataURL,
  blurCompatibilityLevel = 'low',
  priority,
  ...props
}: ImageProps & {
  ref?: RefObject<HTMLImageElement | null>
  blurCompatibilityLevel?: 'none' | 'low' | 'high'
  classNameImage?: string
  priority?: boolean
}) {
  const ref = useRef<HTMLImageElement>(null);

  const { hasLoadedWithAnimations, shouldDebugImageFallbacks } = useAppState();

  const [isLoading, setIsLoading] = useState(true);
  const [didError, setDidError] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [fadeFallbackTransition, setFadeFallbackTransition] =
    useState(!hasLoadedWithAnimations);

  const onLoad = useCallback(() => {
    setIsLoading(false);
    setDidError(false);
  }, []);
  const onError = useCallback(() => {
    if (!useRecovery && !props.unoptimized) {
      // Retry a bounded JPEG, never a potentially enormous camera original.
      setUseRecovery(true);
    } else {
      setDidError(true);
    }
  }, [useRecovery, props.unoptimized]);

  useEffect(() => {
    if (
      !ref.current?.complete ||
      (ref.current?.naturalWidth ?? 0) === 0
    ) {
      setFadeFallbackTransition(true);
    }
  }, []);

  useEffect(() => {
    if (isLoading || didError || shouldDebugImageFallbacks) return;
    const timer = setTimeout(() => setShowPlaceholder(false), 320);
    return () => clearTimeout(timer);
  }, [isLoading, didError, shouldDebugImageFallbacks]);

  const getBlurClass = () => {
    switch (blurCompatibilityLevel) {
      case 'high':
      // Fix poorly blurred placeholder data generated on client
        return 'blur-[4px] @xs:blue-md scale-[1.05]';
      case 'low':
        return 'blur-[2px] @xs:blue-md scale-[1.01]';
    }
  };

  return (
    <div
      className={clsx(
        'flex relative',
        className,
      )}
    >
      <Image ref={refProp ?? ref} {...{
        ...props,
        priority,
        loader: useRecovery ? options => cloudflareImageLoader({
          ...options, width: Math.min(options.width, 1280), quality: 70,
        }).replace('format=auto', 'format=jpeg') : props.loader,
        className: classNameImage,
        onLoad,
        onError,
      }} />
      {(showPlaceholder || shouldDebugImageFallbacks) && <div
        className={clsx(
          '@container',
          'absolute inset-0 pointer-events-none',
          'overflow-hidden',
          fadeFallbackTransition &&
            'transition-opacity duration-300 ease-in',
          !(BLUR_ENABLED && blurDataURL) && 'bg-main',
          (isLoading || didError || shouldDebugImageFallbacks)
            ? 'opacity-100'
            : 'opacity-0',
        )}
      >
        {(BLUR_ENABLED && blurDataURL)
          ? <img {...{
            ...props,
            src: blurDataURL,
            className: clsx(
              getBlurClass(),
              classNameImage,
            ),
          }} />
          :  <div className={clsx(
            'w-full h-full',
            'bg-gray-100/50 dark:bg-gray-900/50',
          )} />}
      </div>}
    </div>
  );
}

export default function ImageWithFallback(
  props: Parameters<typeof ImageWithFallbackInner>[0],
) {
  const key = typeof props.src === 'string' ? props.src : JSON.stringify(props.src);
  const width = Number(props.width) || 1;
  const height = Number(props.height) || 1;
  const empty = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"/>`,
  )}`;
  return <ImageViewport key={key}
    eager={Boolean(props.priority || props.loading === 'eager')}
    placeholder={<div className={clsx('flex relative', props.className)}>
      <img src={empty} alt="" aria-hidden width={props.width} height={props.height}
        className={props.classNameImage ?? 'object-cover h-full'}
        style={props.fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : props.style}
      />
    </div>}>
    <ImageWithFallbackInner {...props} />
  </ImageViewport>;
}
