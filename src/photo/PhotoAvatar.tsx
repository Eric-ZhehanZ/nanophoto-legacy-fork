'use client';
import usePhotoLocalization from './usePhotoLocalization';
import ImageMedium from '@/components/image/ImageMedium';
import { altTextForPhoto, Photo } from '.';
import clsx from 'clsx/lite';
import { ReactNode } from 'react';

export default function PhotoAvatar({
  photo,
  className,
  placeholder,
}: {
  photo?: Photo
  className?: string
  placeholder?: ReactNode
}) {
  const localize = usePhotoLocalization();
  return (
    <span className={clsx(
      'inline-block',
      'size-12 rounded-full overflow-auto',
      'border border-medium bg-dim',
      className,
    )}>
      {photo
        ? <ImageMedium
          src={photo.url}
          className="object-cover w-full h-full"
          alt={altTextForPhoto(localize(photo))}
          blurDataURL={photo.blurData}
          aspectRatio={photo.aspectRatio}
        />
        : placeholder && <span className={clsx(
          'w-full h-full',
          'flex items-center justify-center',
        )}>
          {placeholder}
        </span>}
    </span>
  );
}
