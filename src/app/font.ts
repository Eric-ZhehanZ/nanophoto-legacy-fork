import { getCloudflareContext } from '@opennextjs/cloudflare';
import fs from 'fs';
import path from 'path';
import { cwd } from 'process';

const FONT_IBM_PLEX_MONO_FAMILY = 'IBMPlexMono';
const FONT_IBM_PLEX_MONO_PATH = '/public/fonts/IBMPlexMono-Medium.ttf';

const getFontData = async () => {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const response = await env.ASSETS.fetch('https://assets.local/fonts/IBMPlexMono-Medium.ttf');
    if (!response.ok) throw new Error('Missing OG font asset');
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') throw error;
    return fs.readFileSync(path.join(cwd(), FONT_IBM_PLEX_MONO_PATH));
  }
};

export const getIBMPlexMono = () => getFontData()
  .then(data => ({
    fontFamily: FONT_IBM_PLEX_MONO_FAMILY,
    fonts: [{
      name: FONT_IBM_PLEX_MONO_FAMILY,
      data,
      weight: 500,
      style: 'normal',
    } as const],
  }));
