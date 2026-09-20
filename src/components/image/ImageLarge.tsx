import { IMAGE_QUALITY } from '@/app/config';
import { IMAGE_WIDTH_LARGE, CustomImageProps } from '.';
import ImageWithFallback from './ImageWithFallback';

export default function ImageLarge(props: CustomImageProps) {
  const {
    aspectRatio,
    blurCompatibilityMode,
    ...rest
  } = props;
  return (
    <ImageWithFallback {...{
      sizes: '(max-width: 767px) calc(100vw - 24px), (max-width: 1023px) 73vw, (max-width: 1279px) 72vw, 956px',
      ...rest,
      blurCompatibilityLevel: blurCompatibilityMode ? 'high' : 'none',
      width: IMAGE_WIDTH_LARGE,
      height: Math.round(IMAGE_WIDTH_LARGE / aspectRatio),
      quality: IMAGE_QUALITY,
    }} />
  );
};
