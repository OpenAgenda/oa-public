import React from 'react';
import ReactDom from 'react-dom';
import { Cookies } from 'react-cookie-consent';

import ConsentBanner from '@openagenda/react-shared/src/components/ConsentBanner';
import sharedLocales from '@openagenda/react-shared/lib/locales-compiled';
import { IntlProvider } from 'react-intl';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import appLocales from '../../locales-compiled';

import addGoogleAnalyticsTracker from '../../agenda/js/addGoogleAnalyticsTracker';
import { addMatomoClientTracker } from '../../agenda/js/addMatomoTracker';

export default ({ tracking , lang }) => {
  const {
    googleAnalyticsID,
    matomoUrl,
    matomoSiteId,
    matomoAskForConsent
  } = tracking;

  if (!googleAnalyticsID && !matomoUrl) return;

  if (matomoUrl && matomoSiteId && !matomoAskForConsent) {
    return addMatomoClientTracker(tracking);
  }

  const gaConsent = Cookies.get('GaCookieConsent');
  const matomoConsent = Cookies.get('MatomoCookieConsent');

  if (googleAnalyticsID && gaConsent) {
    return addGoogleAnalyticsTracker({
      googleAnalyticsID: googleAnalyticsID
    })
  }

  if (matomoUrl && matomoSiteId && matomoConsent) {
    return addMatomoClientTracker(tracking);
  }

  const div = document.createElement('div');
  document.querySelector('body').appendChild(div);
  const gaCookieBannerLink = `https://support.google.com/analytics/answer/6004245?hl=${lang}`;
  const mergedLocales = mergeLocales(appLocales, sharedLocales);

  return ReactDom.render(
    <IntlProvider
      key={lang}
      locale={lang}
      messages={mergedLocales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <ConsentBanner onAccept={()=> {
        if (googleAnalyticsID) {
          return addGoogleAnalyticsTracker({
            googleAnalyticsID: googleAnalyticsID
          })
        } else if ( matomoUrl && matomoSiteId) {
          return addMatomoClientTracker(tracking);
        }
      }}
      consentFor={googleAnalyticsID ? 'ga' :'matomo'}
      lang={lang} link={googleAnalyticsID ? gaCookieBannerLink : null} cookieName={googleAnalyticsID ? 'GaCookieConsent' :'MatomoCookieConsent'}/>
    </IntlProvider>,
    div
  )};
