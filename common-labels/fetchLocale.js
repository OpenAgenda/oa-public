export default function fetchLocale(messagesPath, locale) {
  return import(`./locales-compiled/${locale}/${messagesPath}.json`).then(
    (mod) => mod.default,
  );
}
