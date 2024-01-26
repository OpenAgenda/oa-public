import { createIntl, createIntlCache } from '@formatjs/intl';
import getSupportedLocale from './getSupportedLocale';

export default function createIntlByLocale(locales) {
  const cache = createIntlCache();

  return Object.entries(locales).reduce(
    (byLocale, [locale, localeMessages]) => {
      if (locale === 'io') {
        return byLocale;
      }

      byLocale[locale] = createIntl(
        {
          locale,
          messages: localeMessages,
          defaultLocale: getSupportedLocale(locale),
          onError(e) {
            if (e.code !== 'MISSING_DATA') {
              console.error(e);
            }
          },
        },
        cache,
      );

      return byLocale;
    },
    {},
  );
}
