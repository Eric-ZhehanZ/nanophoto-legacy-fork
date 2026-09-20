import loader from '@/platforms/cloudflare-image-loader';

describe('Cloudflare image delivery', () => {
  const previous = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN = 'photos-cdn.example.com';
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN;
    else process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN = previous;
  });
  it('routes every R2 image size through the zone cache', () => {
    expect(loader({ src: 'https://photos-cdn.example.com/photo%20one.jpg', width: 640, quality: 80 }))
      .toBe('https://photos-cdn.example.com/cdn-cgi/image/width=640,quality=80,fit=scale-down,format=auto/photo%20one.jpg');
  });
  it('does not rewrite external, relative, or credential-bearing URLs', () => {
    for (const src of ['/favicon.png', 'https://external.example/image.jpg', 'https://user@photos-cdn.example.com/image.jpg']) {
      expect(loader({ src, width: 640 })).toBe(src);
    }
  });
});
