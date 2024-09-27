export default function hrefWithLang(href, locale = null) {
  const url = new URL(href, 'https://n');

  if (locale) {
    url.searchParams.set('lang', locale);
  }

  return url.origin === 'https://n' ? `${url.pathname}${url.search}` : url.href;
}
