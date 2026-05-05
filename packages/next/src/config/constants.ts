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

// Name of the cookie that carries the session payload (base64-encoded JSON).
// Referenced by session helpers AND by the OTel session enrichment processor
// that reads the cookie from the span's `http.request.header.cookie.oa.user`
// attribute — keep in sync if this ever changes.
export const SESSION_COOKIE_NAME = 'oa.user';
