export default function fetchLocale(locale) {
  return import(`../locales-compiled/${locale}.json`).then(
    (mod) => mod.default,
  );
}
