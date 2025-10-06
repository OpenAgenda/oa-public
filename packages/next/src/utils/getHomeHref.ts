import getSession from './getSession';
import hrefWithLang from './hrefWithLang';

export default function getHomeHref(cookies, intl) {
  const sessionUser = getSession(cookies)?.user;
  return hrefWithLang(
    sessionUser ? '/home' : '/',
    sessionUser ? null : intl.locale,
  );
}
