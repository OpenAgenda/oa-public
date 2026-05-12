export default function fetchLocale(
  locale: string,
): Promise<Record<string, unknown> | null> {
  return import(`./locales/compiled/${locale}.json`, { with: { type: 'json' } })
    .then((mod) => mod.default)
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(`API: Failed to fetch locale ${locale}`, e);
      return null;
    });
}
