import type { ImagesBinding, Hyperdrive, Fetcher } from '@cloudflare/workers-types';
declare global {
  interface CloudflareEnv {
    IMAGES: ImagesBinding;
    ASSETS: Fetcher;
    HYPERDRIVE?: Hyperdrive;
  }
}
export {};
