export default function fetchLocale(locale) {
  return import(`../locales-compiled/${locale}.json`, {
    with: { type: 'json' },
  }).then((mod) => mod.default);
}
