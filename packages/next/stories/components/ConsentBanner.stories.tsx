import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Button } from '@openagenda/uikit';
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
  const [cookies, _setCookie, removeCookie] = useCookies();
  console.log('cookies', cookies);
  useEffect(() => {
    removeCookie('GaCookieConsent');
  }, [removeCookie]);

  return (
    <Providers locale="fr" intlMessages={intlMessages}>
      {cookies.GaCookieConsent !== undefined && (
        <Button
          mx="4"
          colorScheme="red"
          onClick={() => removeCookie('GaCookieConsent')}
        >
          removeCookie
        </Button>
      )}
      <p>
        CookieConsent :{' '}
        {cookies.GaCookieConsent === undefined
          ? 'undefined'
          : JSON.stringify(cookies.GaCookieConsent)}
      </p>
      {cookies.GaCookieConsent === undefined && <ConsentBanner />}
    </Providers>
  );
}
