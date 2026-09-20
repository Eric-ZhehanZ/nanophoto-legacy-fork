/** @jest-environment node */
import { transformImage } from '@/platforms/images';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import jpeg from 'jpeg-js';
import piexif from 'piexifjs';

jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));

const jpegBytes = jpeg.encode({
  width: 1, height: 1, data: Buffer.from([120, 80, 40, 255]),
}, 90).data;
const original = () => {
  const binary = piexif.insert(piexif.dump({
    '0th': { [piexif.ImageIFD.Make]: 'Test camera', [piexif.ImageIFD.Orientation]: 6 },
    Exif: { [piexif.ExifIFD.ISOSpeedRatings]: 400 },
    GPS: { [piexif.GPSIFD.GPSLatitudeRef]: 'N', [piexif.GPSIFD.GPSLatitude]: [[40, 1], [0, 1], [0, 1]] },
  }), jpegBytes.toString('binary'));
  return Uint8Array.from(Buffer.from(binary, 'binary')).buffer;
};

beforeEach(() => {
  const pipeline = {
    transform: jest.fn().mockReturnThis(),
    output: jest.fn().mockResolvedValue({ response: () => new Response(Uint8Array.from(jpegBytes)) }),
  };
  jest.mocked(getCloudflareContext).mockResolvedValue({ env: { IMAGES: { input: () => pipeline } } } as never);
});

test('GPS stripping retains camera EXIF and normalizes transformed orientation', async () => {
  const output = await transformImage(original(), { stripGps: true });
  const exif = piexif.load(output.toString('binary'));
  expect(exif.GPS).toEqual({});
  expect(exif['0th']?.[piexif.ImageIFD.Make]).toBe('Test camera');
  expect(exif['0th']?.[piexif.ImageIFD.Orientation]).toBe(1);
  expect(exif.Exif?.[piexif.ExifIFD.ISOSpeedRatings]).toBe(400);
  expect(exif.thumbnail).toBeFalsy();
});

test('ordinary thumbnails contain no copied GPS or EXIF metadata', async () => {
  const output = await transformImage(original(), { width: 200 });
  const exif = piexif.load(output.toString('binary'));
  expect(exif.GPS).toEqual({});
  expect(exif['0th']).toEqual({});
});

test('non-JPEG input safely returns the transformed JPEG when metadata cannot be read', async () => {
  const output = await transformImage(new ArrayBuffer(2), { preserveExif: true });
  expect(output).toEqual(jpegBytes);
});
