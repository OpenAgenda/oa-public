import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { Button } from '@openagenda/uikit';
import ConsentBanner from 'components/ConsentBanner';
import fetchLocale from 'app/locales';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'components/ConsentBanner',
  component: ConsentBanner,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
  decorators: [ProvidersDecorator],
};

export function ConsentBannerFixed() {
  const [cookies, , removeCookie] = useCookies();

  useEffect(() => {
    removeCookie('GaCookieConsent');
  }, [removeCookie]);

  return (
    <>
      {cookies.GaCookieConsent !== undefined && (
        <Button
          mx="4"
          colorPalette="red"
          onClick={() => removeCookie('GaCookieConsent')}
        >
          Remove cookie
        </Button>
      )}
      <p>
        CookieConsent :{' '}
        {cookies.GaCookieConsent === undefined
          ? 'undefined'
          : JSON.stringify(cookies.GaCookieConsent)}
      </p>
      {cookies.GaCookieConsent === undefined && <ConsentBanner />}
    </>
  );
}

export function ConsentBannerOverlay() {
  const [cookies, , removeCookie] = useCookies();

  useEffect(() => {
    removeCookie('GaCookieConsent');
  }, [removeCookie]);

  return (
    <>
      {cookies.GaCookieConsent !== undefined && (
        <Button
          mx="4"
          colorPalette="red"
          onClick={() => removeCookie('GaCookieConsent')}
        >
          Remove cookie
        </Button>
      )}
      <p>
        CookieConsent :{' '}
        {cookies.GaCookieConsent === undefined
          ? 'undefined'
          : JSON.stringify(cookies.GaCookieConsent)}
      </p>
      {cookies.GaCookieConsent === undefined && (
        <ConsentBanner display="overlay" />
      )}
    </>
  );
}
