import { getCloudflareContext } from '@opennextjs/cloudflare';
import piexif from 'piexifjs';

export interface ImageOptions {
  width?: number;
  blur?: number;
  saturation?: number;
  quality?: number;
  preserveExif?: boolean;
  stripGps?: boolean;
}

export async function transformImage(image: ArrayBuffer, options: ImageOptions = {}) {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.IMAGES) throw new Error('Cloudflare Images binding is required');
  const response = (await env.IMAGES.input(new Blob([image]).stream() as unknown as Parameters<typeof env.IMAGES.input>[0])
    .transform({
      ...(options.width && { width: options.width, fit: 'scale-down' as const }),
      ...(options.blur && { blur: options.blur }),
      ...(options.saturation && { saturation: options.saturation }),
    })
    .output({ format: 'image/jpeg', quality: options.quality ?? 80 }))
    .response();
  let result = Buffer.from(await response.arrayBuffer());
  // The transform strips metadata and applies orientation. Reattach only EXIF,
  // never the original XMP (which may contain GPS coordinates).
  if (options.preserveExif || options.stripGps) {
    let exif;
    try { exif = piexif.load(Buffer.from(image).toString('binary')); }
    catch { return result; } // Non-JPEG input has no JPEG EXIF to copy.
    exif['0th'] = { ...exif['0th'], [piexif.ImageIFD.Orientation]: 1 };
    exif['1st'] = {};
    exif.thumbnail = undefined;
    if (options.stripGps) exif.GPS = {};
    result = Buffer.from(piexif.insert(piexif.dump(exif), result.toString('binary')), 'binary');
  }
  return result;
}
