export const SUPPORTED_LOCALES = [
  'en',
  'fr',
  'de',
  'it',
  'es',
  'br',
  'ca',
  'eu',
  'oc',
  'io',
  'nl',
];

// Human-facing languages offered in pickers (settings "Langue" + the navbar
// language switcher), with display labels. A curated subset of SUPPORTED_LOCALES
// — excludes the crowdin placeholders (ca/eu/io). Single source so the settings
// list and the switcher can't drift apart.
export const LANGUAGES: { code: string; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'br', label: 'Brezhoneg' },
  { code: 'oc', label: 'Occitan' },
];

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
