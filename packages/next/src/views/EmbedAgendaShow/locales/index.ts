// DOES NOT EDIT, generated file by 'oa-intl'

/* eslint-disable */

import fetchLocale0 from 'components/ConsentBanner/locales';
import fetchLocale1 from 'components/ErrorDisplay/locales';
import fetchLocale2 from 'components/locales';
import fetchLocale3 from 'views/AgendaShow/components/locales';
import fetchLocale4 from 'views/AgendaShow/locales';
import fetchLocale5 from 'views/EventShow/locales';

export default async function fetchLocale(locale) {
  return Promise.all([
    import(`./compiled/${locale}.json`).then((mod) => mod.default),
    fetchLocale0(locale),
    fetchLocale1(locale),
    fetchLocale2(locale),
    fetchLocale3(locale),
    fetchLocale4(locale),
    fetchLocale5(locale),
  ])
    .then((results) => Object.assign({}, ...results))
    .catch((e) => {
      console.error(`API: Failed to fetch locale ${locale}`, e);
      return {};
    });
}
