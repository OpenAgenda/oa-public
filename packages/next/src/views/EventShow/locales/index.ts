// DOES NOT EDIT, generated file by 'oa-intl'

/* eslint-disable */

import fetchLocale0 from 'components/Navbar/locales';

export default async function fetchLocale(locale) {
  return Promise.all([
    fetchLocale0(locale),
  ])
    .then(results => Object.assign({}, ...results))
    .catch(e => {
      console.error(`API: Failed to fetch locale ${locale}`, e);
      return null;
    });
}
