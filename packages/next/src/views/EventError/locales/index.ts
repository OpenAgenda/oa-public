// DOES NOT EDIT, generated file by 'oa-intl'

/* eslint-disable */

import fetchLocale0 from 'components/ErrorDisplay/locales';
import fetchLocale1 from 'components/LockIcon/locales';
import fetchLocale2 from 'components/Navbar/locales';
import fetchLocale3 from 'components/NavbarSearchInput/locales';
import fetchLocale4 from 'components/OfficialAgenda/locales';
import fetchLocale5 from 'components/locales';
import fetchLocale6 from 'views/EventShow/components/locales';
import fetchLocale7 from 'views/EventShow/locales';

export default async function fetchLocale(locale) {
  return Promise.all([
    import(`./compiled/${locale}.json`).then((mod) => mod.default),
    fetchLocale0(locale),
    fetchLocale1(locale),
    fetchLocale2(locale),
    fetchLocale3(locale),
    fetchLocale4(locale),
    fetchLocale5(locale),
    fetchLocale6(locale),
    fetchLocale7(locale),
  ])
    .then((results) => Object.assign({}, ...results))
    .catch((e) => {
      console.error(`API: Failed to fetch locale ${locale}`, e);
      return null;
    });
}
