import { cache } from 'react';
import { createIntl, createIntlCache } from 'react-intl/server';
import fetchLocale from 'app/locales';
import getLocale from './getLocale';

const intlCache = createIntlCache();

const getIntl = cache(async () => {
  const locale = await getLocale();
  const messages = await fetchLocale(locale);
  return createIntl({ locale, messages }, intlCache);
});

export default getIntl;
