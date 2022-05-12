import { DEFAULT_FALLBACK_MAP, DEFAULT_LANG } from './constants';

export default function getFallbackChain(lang, fallbackMap = DEFAULT_FALLBACK_MAP, defaultLang = DEFAULT_LANG) {
  const result = [lang];
  let cursor = fallbackMap[lang];

  while (cursor) {
    result.push(cursor);
    cursor = fallbackMap[cursor];
  }

  result.push(defaultLang);

  return result;
}
