// DOES NOT EDIT, generated file by 'oa-intl'

/* eslint-disable */

export default async function fetchLocale(locale) {
  return Promise.all([
  ])
    .then(results => Object.assign({}, ...results))
    .catch(e => {
      console.error(`API: Failed to fetch locale ${locale}`, e);
      return null;
    });
}
