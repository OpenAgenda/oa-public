// External package locales (not aggregated by extractMessages.mjs).
// Add an entry here for any external @openagenda/* bundle whose messages
// must be available globally to App Router pages.

import fetchCommonLocale from '@openagenda/common-labels/fetchLocale';
import { fetchLocale as fetchFiltersLocale } from '@openagenda/react-filters';
import fetchReactLocale from '@openagenda/react/fetchLocale';

export default async function fetchExternalLocale(
  locale: string,
): Promise<Record<string, string>> {
  const results = await Promise.all([
    fetchCommonLocale('geo', locale),
    fetchCommonLocale('event/attendanceModes', locale),
    fetchCommonLocale('event/statuses', locale),
    fetchCommonLocale('event/fields', locale),
    fetchCommonLocale('event/states', locale),
    fetchCommonLocale('event/accessibilities', locale),
    fetchCommonLocale('roles', locale),
    fetchFiltersLocale(locale),
    fetchReactLocale(locale),
  ]);

  return Object.assign({}, ...results);
}
