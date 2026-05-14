import { DEFAULT_FALLBACK_MAP, DEFAULT_LANG } from './constants.js';
import getFallbackChain from './getFallbackChain.js';

export default function getSupportedLocale(
  lang,
  fallbackMap = DEFAULT_FALLBACK_MAP,
  defaultLang = DEFAULT_LANG,
) {
  const fallbacks = getFallbackChain(lang, fallbackMap, defaultLang);
  return Intl.NumberFormat.supportedLocalesOf(fallbacks)[0];
}
