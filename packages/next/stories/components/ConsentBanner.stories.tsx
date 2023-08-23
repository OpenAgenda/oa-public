import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
  Button,
} from '@openagenda/uikit';
import Providers from 'Providers';
import ConsentBanner from 'components/ConsentBanner';
import fetchAllLocales from '../utils/fetchAllLocales';

export default {
  title: 'components/ConsentBanner',
  component: ConsentBanner,
  loaders: [
    async () => ({
      intlMessages: await fetchAllLocales('fr'),
    }),
  ],
};

export function ConsentBannerComponent(_args, { loaded: { intlMessages } }) {
  const [cookies, setCookie, removeCookie] = useCookies();

  useEffect(() => {
    removeCookie('CookieConsent');
  }, [removeCookie]);

  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      {cookies.CookieConsent && <Button mx="4" colorScheme="red" onClick={() => removeCookie('CookieConsent')}>removeCookie</Button>}
      <p>CookieConsent : {cookies.CookieConsent}</p>
      {cookies.CookieConsent === undefined && (
        <ConsentBanner
          setCookie={setCookie}
        />
      )}
    </Providers>
  );
}
