import { createIntl, createIntlCache } from '@formatjs/intl';
import getSupportedLocale from './getSupportedLocale';

export default function createIntlByLocale(locales) {
  const cache = createIntlCache();

  return Object.entries(locales)
    .reduce((byLocale, [locale, localeMessages]) => {
      if (locale === 'io') {
        return byLocale;
      }

      try {
        byLocale[locale] = createIntl({
          locale,
          messages: localeMessages,
          defaultLocale: getSupportedLocale(locale)
        }, cache);
      } catch (e) {
        console.log(e);
      }

      return byLocale;
    }, {});
}
