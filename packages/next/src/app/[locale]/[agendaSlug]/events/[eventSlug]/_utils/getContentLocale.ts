import { getFallbackChain } from '@openagenda/intl';
import { FALLBACK_LOCALE, FALLBACK_LOCALES } from '@/src/config/constants';

// TODO copier le comportement de `getPreferredLocale`: cl > queryLang > nextLocale > userLocale
export default function getContentLocale(
  contentLocales,
  contentLocale,
  locale,
) {
  return [
    ...getFallbackChain(contentLocale, FALLBACK_LOCALES, locale),
    FALLBACK_LOCALE,
    contentLocales[0],
  ].find((l) => contentLocales.includes(l));
}
