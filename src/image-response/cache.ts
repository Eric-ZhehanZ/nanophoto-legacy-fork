export const getImageResponseCacheControlHeaders = (
  shouldCache = process.env.NODE_ENV === 'production',
) => {
  return {
    'Cache-Control': shouldCache
      ? 's-maxage=3600, stale-while-revalidate=31536000'
      : 's-maxage=1, stale-while-revalidate=59',
  };
};
