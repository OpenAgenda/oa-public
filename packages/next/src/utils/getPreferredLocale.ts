import { getFallbackChain } from '@openagenda/intl';
import { DEFAULT_LOCALE, FALLBACK_LOCALE, FALLBACK_LOCALES, SUPPORTED_LOCALES } from 'config/constants';

function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

function getFallbackedLocale(locale) {
  return isSupportedLocale(locale)
    ? locale
    : getFallbackChain(locale, FALLBACK_LOCALES, FALLBACK_LOCALE);
}

export default function getPreferredLocale(nextLocale, qsLocale) {
  if (nextLocale === 'default') {
    return qsLocale
      ? getFallbackedLocale(qsLocale)
      : DEFAULT_LOCALE;
  }

  return getFallbackedLocale(nextLocale);
}
