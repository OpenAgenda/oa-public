import { createIntl, createIntlCache } from '@formatjs/intl';
import getSupportedLocale from './getSupportedLocale.js';

export default function createIntlByLocale(locales) {
  const cache = createIntlCache();

  return Object.entries(locales).reduce(
    (byLocale, [locale, localeMessages]) => {
      if (locale === 'io') {
        return byLocale;
      }
      // Filter to BCP 47 shapes.
      if (!/^[a-z]{2,3}(-[A-Z][A-Za-z0-9]{1,7})?$/.test(locale)) {
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
