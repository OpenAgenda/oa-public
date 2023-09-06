import { DEFAULT_LANG, DEFAULT_FALLBACK_MAP } from './constants';
import getFallbackChain from './getFallbackChain';
import completeMessages from './utils/completeMessages';

export default function getFallbackedMessages(
  messagesMap,
  fallbackMap = DEFAULT_FALLBACK_MAP,
  defaultLang = DEFAULT_LANG,
) {
  const langs = Object.keys(messagesMap);
  const result = {};

  for (const lang of langs) {
    const fallbacks = getFallbackChain(lang, fallbackMap, defaultLang);

    result[lang] = {};

    for (const fallback of fallbacks) {
      result[lang] = completeMessages(result[lang], messagesMap[fallback]);
    }
  }

  return result;
}
