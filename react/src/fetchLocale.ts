export default function fetchLocale(locale) {
  return import(`./locales/compiled/${locale}.json`)
    .then((mod) => mod.default)
    .catch((e) => {
      console.error(`API: Failed to fetch locale ${locale}`, e);
      return null;
    });
}
