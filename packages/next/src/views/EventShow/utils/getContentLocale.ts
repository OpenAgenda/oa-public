import { getFallbackChain } from '@openagenda/intl';
import { FALLBACK_LOCALE, FALLBACK_LOCALES } from 'config/constants';

// TODO copier le comportement de `getPreferredLocale` ?
export default function getContentLocale(contentLocales, contentLocale, locale) {
  return [
    ...getFallbackChain(contentLocale, FALLBACK_LOCALES, locale),
    FALLBACK_LOCALE,
    contentLocales[0],
  ]
    .find(l => contentLocales.includes(l));
}
