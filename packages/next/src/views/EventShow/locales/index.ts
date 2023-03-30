// DOES NOT EDIT, generated file by 'oa-intl'

/* eslint-disable */

import fetchLocale0 from 'components/ErrorDisplay/locales';
import fetchLocale1 from 'components/Navbar/locales';
import fetchLocale2 from 'components/SearchInput/locales';

export default async function fetchLocale(locale) {
  return Promise.all([
    fetchLocale0(locale),
    fetchLocale1(locale),
    fetchLocale2(locale),
  ])
    .then(results => Object.assign({}, ...results))
    .catch(e => {
      console.error(`API: Failed to fetch locale ${locale}`, e);
      return null;
    });
}
