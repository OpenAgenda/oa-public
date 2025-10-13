export default function fetchLocale(messagesPath, locale) {
  return import(`./locales-compiled/${locale}/${messagesPath}.json`, {
    with: { type: 'json' },
  }).then((mod) => mod.default);
}
