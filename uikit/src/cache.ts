import createCache, { type EmotionCache } from '@emotion/cache';

export { EmotionCache };

export default function createEmotionCache() {
  return createCache({ key: 'oa' });
}

export const defaultCache = createEmotionCache();
