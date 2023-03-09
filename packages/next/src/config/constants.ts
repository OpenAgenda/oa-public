export const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'it', 'es', 'br', 'ca', 'eu', 'oc', 'io'];

// Used when no locale is detected
export const DEFAULT_LOCALE = 'fr';

// Used when a locale is detected but not supported
export const FALLBACK_LOCALE = 'en';

export const FALLBACK_LOCALES = {
  br: 'fr',
  ca: 'es',
  eu: 'es',
  oc: 'fr',
};
