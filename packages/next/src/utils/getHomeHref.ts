import hrefWithLang from './hrefWithLang';

type IntlLike = { locale: string };

// Returns `/home` for signed-in visitors (cibul-node legacy route, served
// unlocalized) and the localized landing for everyone else. The caller
// passes the resolved sign-in state — server components can use
// `getSession()` from utils/getSession, client components can read
// `authClient.useSession()` from @openagenda/auth/react.
export default function getHomeHref(isLogged: boolean, intl: IntlLike) {
  return hrefWithLang(isLogged ? '/home' : '/', isLogged ? null : intl.locale);
}
