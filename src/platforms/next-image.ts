import cloudflareImageLoader from './cloudflare-image-loader';
import {
  BASE_URL,
  IMAGE_QUALITY,
} from '@/app/config';

// Explicity defined next.config.js `imageSizes`
type NextCustomSize = 100 | 200;

type NextImageDeviceSize = 640 | 750 | 828 | 1080 | 1200 | 1920 | 2048 | 3840;

export type NextImageSize = NextCustomSize | NextImageDeviceSize;

export const MAX_IMAGE_SIZE: NextImageSize = 3840;

export const getNextImageUrlForRequest = ({
  imageUrl,
  size,
  quality = IMAGE_QUALITY,
  baseUrl = BASE_URL,
}: {
  imageUrl: string
  size: NextImageSize
  quality?: number
  baseUrl?: string
  addBypassSecret?: boolean
}) => {
  const resized = cloudflareImageLoader({ src: imageUrl, width: size, quality });
  if (resized !== imageUrl) return resized;
  const url = new URL(`${baseUrl}/_next/image`);

  url.searchParams.append('url', imageUrl);
  url.searchParams.append('w', size.toString());
  url.searchParams.append('q', quality.toString());

  return url.toString();
};
