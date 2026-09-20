import type { ImageLoaderProps } from 'next/image';

// Let Cloudflare's zone image cache serve resized R2 images directly.
// This avoids relaying every image through the application Worker.
export default function cloudflareImageLoader({
  src, width, quality = 75,
}: ImageLoaderProps): string {
  const host = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN;
  if (!host || !src.startsWith('https://')) return src;
  const url = new URL(src);
  if (url.hostname !== host || url.username || url.password) return src;
  const options = `width=${width},quality=${quality},fit=scale-down,format=auto`;
  return `${url.origin}/cdn-cgi/image/${options}${url.pathname}${url.search}`;
}
