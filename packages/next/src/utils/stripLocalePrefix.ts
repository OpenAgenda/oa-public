import { SUPPORTED_LOCALES } from 'config/constants';

// Strip a leading /<locale> segment from a pathname, leaving the locale-agnostic
// remainder (e.g. /fr/settings/notifications -> /settings/notifications). Used to
// rebuild the same path under a different locale prefix when switching language.
export default function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/');
  if (segments.length > 1 && SUPPORTED_LOCALES.includes(segments[1])) {
    return '/' + segments.slice(2).join('/') || '/';
  }
  return pathname;
}
