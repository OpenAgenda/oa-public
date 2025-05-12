import createCache, { type EmotionCache } from '@emotion/cache';

export { CacheProvider } from '@emotion/react';

export { createCache, EmotionCache };

export default function createEmotionCache() {
  return createCache({ key: 'oa' });
}

export const defaultCache = createEmotionCache();
