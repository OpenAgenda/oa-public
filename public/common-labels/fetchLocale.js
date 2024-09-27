export default function fetchLocale(messagesPath, locale) {
  return import(`./locales-compiled/${locale}/${messagesPath}`).then(
    (mod) => mod.default,
  );
}
