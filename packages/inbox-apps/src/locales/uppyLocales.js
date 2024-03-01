import { getFallbackChain } from '@openagenda/intl';

export const LOCALES_MAP = {
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  es: 'es_ES',
  br: 'fr_FR',
  ca: 'es_ES',
  eu: 'es_ES',
  oc: 'fr_FR',
};

export default async function getUppyLocale(locale) {
  const fallbacks = getFallbackChain(locale);

  for (const l of fallbacks) {
    try {
      if (LOCALES_MAP[l]) {
        return (await import(`@uppy/locales/lib/${LOCALES_MAP[l]}.js`)).default;
      }
    } catch {
      //
    }
  }
}
