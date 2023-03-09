import { getFallbackChain } from '@openagenda/intl';
import { DEFAULT_LOCALE, FALLBACK_LOCALE, FALLBACK_LOCALES, SUPPORTED_LOCALES } from 'config/constants';

function isSupportedLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

function getFallbackedLocale(locale) {
  return getFallbackChain(locale, FALLBACK_LOCALES, FALLBACK_LOCALE)
    .find(isSupportedLocale);
}

export default function getPreferredLocale(...locales) {
  for (const locale of locales) {
    if (locale && locale !== 'default') {
      return getFallbackedLocale(locale);
    }
  }

  return DEFAULT_LOCALE;
}
