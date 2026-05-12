import createCache, { type EmotionCache } from '@emotion/cache';

export { CacheProvider } from '@emotion/react';

export { createCache, type EmotionCache };

export function createEmotionCache() {
  return createCache({ key: 'oa' });
}

export const defaultCache = createEmotionCache();
