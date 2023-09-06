export default function loadLocale(locale) {
  return Promise.all([
    import(`@formatjs/intl-pluralrules/dist/locale-data/${locale}`),
    import(`@formatjs/intl-displaynames/dist/locale-data/${locale}`),
    import(`@formatjs/intl-relativetimeformat/dist/locale-data/${locale}`),
    import(`@formatjs/intl-listformat/dist/locale-data/${locale}`),
    import(`@formatjs/intl-numberformat/dist/locale-data/${locale}`),
    import(`@formatjs/intl-datetimeformat/dist/locale-data/${locale}`)
  ]);
};
