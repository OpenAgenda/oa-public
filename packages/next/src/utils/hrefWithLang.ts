export default function hrefWithLang(href, locale = null) {
  const url = new URL(href, 'http://n');

  if (locale) {
    url.searchParams.set('lang', locale);
  }

  return url.origin === 'http://n'
    ? `${url.pathname}${url.search}`
    : url.href;
}
