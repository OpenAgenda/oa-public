// DOES NOT EDIT, generated file by 'oa-intl'

/* eslint-disable */

export default async function fetchLocale(locale) {
  return import(`./compiled/${locale}.json`)
    .then((mod) => mod.default)
    .catch((e) => {
      console.error(`API: Failed to fetch locale ${locale}`, e);
      return null;
    });
}
